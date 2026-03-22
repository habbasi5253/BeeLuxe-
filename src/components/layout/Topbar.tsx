'use client'

import { Bell, Search, User } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-luxe-100 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-bold text-luxe-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-luxe-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-luxe-50 text-luxe-500 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bee-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-bee flex items-center justify-center text-white">
          <User size={15} />
        </div>
      </div>
    </header>
  )
}
