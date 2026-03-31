'use client'

import { Suspense, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      const redirect = searchParams.get('redirect') ?? '/dashboard'
      router.push(redirect)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <p className="font-bold text-luxe-900 mb-5 text-center">Sign In</p>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email" required className="input" placeholder="admin@beeluxe.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password" required className="input" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <><Loader2 size={15} className="animate-spin" />Signing in…</> : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-xs text-luxe-400 mt-4">
        Sign in with your BeeLuxe account
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-bee flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🐝
          </div>
          <h1 className="text-2xl font-bold text-white">BeeLuxe Cleaners</h1>
          <p className="text-luxe-400 text-sm mt-1">Business-in-a-Box Platform</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-2xl p-6 text-center text-luxe-400">Loading…</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
