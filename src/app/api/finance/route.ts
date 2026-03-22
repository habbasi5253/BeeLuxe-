import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const report = searchParams.get('report') ?? 'summary'

  if (report === 'summary') {
    // Aggregate revenue, payouts, and margin data
    const [invoicesRes, payoutsRes, expensesRes] = await Promise.all([
      supabase.from('invoices').select('amount, total, status, issued_date').eq('status', 'paid'),
      supabase.from('contractor_payouts').select('amount, bonus, status'),
      supabase.from('expenses').select('amount, category, date'),
    ])

    const revenue = invoicesRes.data?.reduce((s, i) => s + i.total, 0) ?? 0
    const payouts = payoutsRes.data?.reduce((s, p) => s + p.amount + p.bonus, 0) ?? 0
    const expenses = expensesRes.data?.reduce((s, e) => s + e.amount, 0) ?? 0
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
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        invoices ( total, status )
      `)
      .order('total_revenue', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (report === 'payouts') {
    const { data, error } = await supabase
      .from('contractor_payouts')
      .select(`
        *,
        cleaners ( full_name ),
        jobs ( title, scheduled_start )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Unknown report' }, { status: 400 })
}
