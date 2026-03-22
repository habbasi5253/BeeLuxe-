import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/supabase/db'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const report = searchParams.get('report') ?? 'summary'

  if (report === 'summary') {
    const [invoicesRes, payoutsRes, expensesRes] = await Promise.all([
      db(supabase).invoices.paid(),
      db(supabase).payouts.select(),
      db(supabase).expenses.select(),
    ])

    const revenue  = (invoicesRes.data ?? []).reduce((s, i) => s + Number(i.total), 0)
    const payouts  = (payoutsRes.data  ?? []).reduce((s, p) => s + Number(p.amount) + Number(p.bonus), 0)
    const expenses = (expensesRes.data ?? []).reduce((s, e) => s + Number(e.amount), 0)
    const grossMargin = revenue > 0 ? ((revenue - payouts) / revenue) * 100 : 0

    return NextResponse.json({
      revenue,
      payouts,
      expenses,
      gross_profit: revenue - payouts,
      net_profit: revenue - payouts - expenses,
      gross_margin_pct: grossMargin.toFixed(1),
    })
  }

  if (report === 'client_ledger') {
    const { data, error } = await db(supabase).clients.select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (report === 'payouts') {
    const { data, error } = await db(supabase).payouts.list()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
}
