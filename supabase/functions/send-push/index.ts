import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import webpush from 'npm:web-push@3.6.7'

type PushPayload = {
  title?: string
  body?: string
  url?: string
  profileIds?: string[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@68riders.com.tr'

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return json({ error: 'Push environment variables are missing.' }, 500)
  }

  const authorization = request.headers.get('Authorization') || ''
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })

  const { data: adminOk, error: adminError } = await userClient.rpc('is_admin')
  if (adminError || !adminOk) return json({ error: 'Admin access required.' }, 403)

  const payload = (await request.json().catch(() => ({}))) as PushPayload
  const serviceClient = createClient(supabaseUrl, serviceRoleKey)
  let query = serviceClient.from('push_subscriptions').select('profile_id, subscription')
  if (payload.profileIds?.length) query = query.in('profile_id', payload.profileIds)

  const { data: subscriptions, error } = await query
  if (error) return json({ error: error.message }, 500)

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const notification = JSON.stringify({
    title: payload.title || '68 Riders',
    body: payload.body || 'Yeni bir bildirim var.',
    url: payload.url || '/',
  })

  const results = await Promise.allSettled(
    (subscriptions || []).map((item) => webpush.sendNotification(item.subscription, notification)),
  )

  return json({
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
