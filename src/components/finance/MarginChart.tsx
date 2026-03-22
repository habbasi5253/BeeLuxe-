'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const data = [
  { month: 'Aug', margin: 58.8, target: 60 },
  { month: 'Sep', margin: 60.1, target: 60 },
  { month: 'Oct', margin: 57.3, target: 60 },
  { month: 'Nov', margin: 61.0, target: 60 },
  { month: 'Dec', margin: 60.9, target: 60 },
  { month: 'Jan', margin: 61.0, target: 60 },
]

const CustomDot = (props: { cx?: number; cy?: number; value?: number }) => {
  const { cx, cy, value } = props
  if (cx === undefined || cy === undefined) return null
  return (
    <circle
      cx={cx} cy={cy} r={4}
      fill={value && value >= 60 ? '#10b981' : '#f59e0b'}
      stroke="white" strokeWidth={2}
    />
  )
}

export function MarginChart() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-luxe-800">Gross Margin Trend</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Margin %</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-luxe-300 inline-block rounded border-dashed" /> 60% Target</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
            domain={[50, 70]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Gross Margin']}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <ReferenceLine y={60} stroke="#cbd5e1" strokeDasharray="4 4" />
          <Area
            type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2.5}
            fill="url(#marginGrad)" dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
