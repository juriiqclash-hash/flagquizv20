// Supabase Edge Function: admin-delete-user
// Deletes a user and related profile using the service role. Only admins can call this.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client with the caller's JWT to check admin role
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: authData, error: authErr } = await authClient.auth.getUser()
    if (authErr || !authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const callerId = authData.user.id
    // Check admin role using security definer function
    const { data: roleOk, error: roleErr } = await authClient.rpc('has_role', { _user_id: callerId, _role: 'admin' })
    if (roleErr || !roleOk) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Service role client to perform privileged operations
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Delete profile first (idempotent)
    await serviceClient.from('profiles').delete().eq('user_id', userId)
    await serviceClient.from('user_stats').delete().eq('user_id', userId)
    await serviceClient.from('leaderboards').delete().eq('user_id', userId)

    // Delete auth user
    const { error: delErr } = await serviceClient.auth.admin.deleteUser(userId)
    if (delErr) {
      return new Response(JSON.stringify({ error: String(delErr) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
