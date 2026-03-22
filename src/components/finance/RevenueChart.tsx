'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Aug', revenue: 18200, payouts: 7080, expenses: 1820 },
  { month: 'Sep', revenue: 21400, payouts: 8340, expenses: 2100 },
  { month: 'Oct', revenue: 19800, payouts: 7720, expenses: 1980 },
  { month: 'Nov', revenue: 23100, payouts: 9010, expenses: 2310 },
  { month: 'Dec', revenue: 26400, payouts: 10300, expenses: 2640 },
  { month: 'Jan', revenue: 28450, payouts: 11082, expenses: 2140 },
]

export function RevenueChart() {
  return (
    <div className="card">
      <p className="font-semibold text-luxe-800 mb-4">Revenue vs Payouts vs Expenses</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, String(name)]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payouts" name="Payouts" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
