/*
  # Drop Old Subscriptions Table

  1. Changes
    - Drop the old `subscriptions` table that conflicts with stripe_subscriptions
    - This table is being replaced by the stripe_customers/stripe_subscriptions architecture
    
  2. Important Notes
    - We are consolidating to use stripe_customers and stripe_subscriptions tables
    - The stripe integration tables provide better separation of concerns
    - Any existing subscription data should be migrated before running this
    - If no data exists yet, this is a safe cleanup operation
*/

-- Drop the old subscriptions table if it exists
DROP TABLE IF EXISTS public.subscriptions CASCADE;
