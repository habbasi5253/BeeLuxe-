/**
 * POST /api/webpush/send
 *
 * Sends a Web Push notification to a specific cleaner (by cleaner_id) or to
 * all active cleaners with push subscriptions.
 *
 * Body:
 *   { cleaner_id?: string, title: string, body: string, url?: string }
 *   If cleaner_id is omitted, broadcasts to all subscribed cleaners.
 *
 * Required env vars:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT  (e.g. "mailto:dispatch@beeluxecleaners.com")
 *
 * Generate VAPID keys (one-time):
 *   node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(JSON.stringify(k,null,2))"
 */
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

function getWebPush() {
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject    = process.env.VAPID_SUBJECT ?? 'mailto:dispatch@beeluxecleaners.com'

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Generate them with: ' +
      'node -e "const wp=require(\'web-push\'); console.log(JSON.stringify(wp.generateVAPIDKeys(),null,2))"'
    )
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  return webpush
}

export async function POST(req: NextRequest) {
  try {
    const { cleaner_id, title, body, url } = await req.json() as {
      cleaner_id?: string
      title:       string
      body:        string
      url?:        string
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }

    const wp       = getWebPush()
    const supabase = await createClient()
    const payload  = JSON.stringify({ title, body, url: url ?? '/portal' })

    // Fetch target cleaner(s)
    const query = supabase
      .from('cleaners')
      .select('id, full_name, push_subscription')
      .not('push_subscription', 'is', null)

    if (cleaner_id) query.eq('id', cleaner_id)

    const { data: cleaners, error } = await query
    if (error) throw error

    const results = await Promise.allSettled(
      (cleaners ?? []).map(async (cleaner) => {
        const sub = JSON.parse(cleaner.push_subscription as string) as PushSubscriptionJSON
        await wp.sendNotification(sub as Parameters<typeof wp.sendNotification>[0], payload)
        return cleaner.id
      })
    )

    const sent    = results.filter((r) => r.status === 'fulfilled').length
    const failed  = results.filter((r) => r.status === 'rejected').length

    logger.info('general', 'Push notifications sent', { sent, failed })
    return NextResponse.json({ success: true, sent, failed })
  } catch (err) {
    logger.error('general', err)
    return NextResponse.json({ error: 'Push notification failed' }, { status: 500 })
  }
}
