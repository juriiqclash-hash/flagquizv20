
import Stripe from 'https://esm.sh/stripe@17.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    await handleEvent(event);

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // Fetch customer to get email
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted || !customer.email) {
      console.error('Invalid customer or missing email');
      return;
    }

    // Find the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    const user = users.users.find(u => u.email === customer.email);
    if (!user) {
      console.error(`No user found for email: ${customer.email}`);
      return;
    }

    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      
      // Get payment method details
      let paymentMethodBrand = null;
      let paymentMethodLast4 = null;
      
      if (subscription.default_payment_method && typeof subscription.default_payment_method === 'object') {
        const pm = subscription.default_payment_method as Stripe.PaymentMethod;
        if (pm.card) {
          paymentMethodBrand = pm.card.brand;
          paymentMethodLast4 = pm.card.last4;
        }
      }

      // Upsert into stripe_user_subscriptions table
      const { error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .upsert({
          user_id: user.id,
          customer_id: customerId,
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          price_id: priceId,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          payment_method_brand: paymentMethodBrand,
          payment_method_last4: paymentMethodLast4,
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error('Error syncing subscription:', subError);
        throw new Error('Failed to sync subscription in database');
      }
      console.info(`Successfully synced subscription for customer: ${customerId}, user: ${user.id}, price: ${priceId}, status: ${subscription.status}`);
    } else {
      // No active subscription - set user back to free
      const { error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .upsert({
          user_id: user.id,
          customer_id: customerId,
          subscription_id: null,
          subscription_status: null,
          price_id: null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          payment_method_brand: null,
          payment_method_last4: null,
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error('Error clearing subscription:', subError);
      }
      console.info(`No active subscription for customer: ${customerId}, user: ${user.id} - set to free`);
    }
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}