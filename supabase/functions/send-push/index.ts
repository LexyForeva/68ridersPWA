/**
 * Supabase Edge Function: Send Push Notifications
 * Sends push notifications to subscribed users
 * 
 * Usage:
 * curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-push \
 *   -H "Authorization: Bearer YOUR_ANON_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"title":"Test","body":"Hello World","targetUserIds":["uuid1","uuid2"]}'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@68riders.com'

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  targetUserIds?: string[]
  targetRoles?: string[]
  excludeUserIds?: string[]
}

interface PushSubscription {
  profile_id: string
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
}

/**
 * Send web push notification
 */
async function sendWebPush(
  subscription: PushSubscription['subscription'],
  payload: object
): Promise<boolean> {
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'TTL': '86400',
        'Content-Encoding': 'aes128gcm',
        'Authorization': generateVapidAuth(subscription.endpoint),
        'Crypto-Key': `p256ecdsa=${VAPID_PUBLIC_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error('Push send error:', error)
    return false
  }
}

/**
 * Generate VAPID authorization header
 */
function generateVapidAuth(endpoint: string): string {
  // Simplified VAPID auth - in production use proper JWT signing
  const parsedUrl = new URL(endpoint)
  const audience = `${parsedUrl.protocol}//${parsedUrl.host}`
  
  // This is a simplified version - you should use proper JWT library
  return `vapid t=PLACEHOLDER_TOKEN, k=${VAPID_PUBLIC_KEY}`
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const payload: PushPayload = await req.json()

    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build subscription query
    let query = supabase
      .from('push_subscriptions')
      .select('profile_id, subscription')

    // Filter by target user IDs
    if (payload.targetUserIds && payload.targetUserIds.length > 0) {
      query = query.in('profile_id', payload.targetUserIds)
    }

    // Filter by roles (requires join with profiles table)
    if (payload.targetRoles && payload.targetRoles.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .in('role', payload.targetRoles)
      
      if (profiles) {
        const profileIds = profiles.map(p => p.id)
        query = query.in('profile_id', profileIds)
      }
    }

    // Exclude specific users
    if (payload.excludeUserIds && payload.excludeUserIds.length > 0) {
      query = query.not('profile_id', 'in', `(${payload.excludeUserIds.join(',')})`)
    }

    const { data: subscriptions, error: fetchError } = await query

    if (fetchError) {
      throw fetchError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No subscriptions found',
          sent: 0 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send push notifications
    const pushPayload = {
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/icon-192.png',
    }

    const sendPromises = subscriptions.map(sub => 
      sendWebPush(sub.subscription, pushPayload)
    )

    const results = await Promise.allSettled(sendPromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Push notifications sent`,
        sent: successCount,
        total: subscriptions.length,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  }
})
