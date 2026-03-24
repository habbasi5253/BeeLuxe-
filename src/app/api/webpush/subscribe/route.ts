/**
 * POST /api/webpush/subscribe
 *
 * Called from the cleaner portal after the user grants notification permission.
 * Saves the PushSubscription object to the `cleaners` table so the server can
 * send targeted push notifications later.
 *
 * Body: { cleaner_id: string, subscription: PushSubscriptionJSON }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const { cleaner_id, subscription } = await req.json() as {
      cleaner_id:   string
      subscription: PushSubscriptionJSON
    }

    if (!cleaner_id || !subscription?.endpoint) {
      return NextResponse.json({ error: 'cleaner_id and subscription are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Store subscription JSON in the cleaners table.
    // Migration 20260325000001_push_subscriptions.sql adds this column.
    const { error } = await supabase
      .from('cleaners')
      .update({ push_subscription: JSON.stringify(subscription) })
      .eq('id', cleaner_id)

    if (error) throw error

    logger.info('general', 'Push subscription saved', { cleaner_id })
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('general', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
