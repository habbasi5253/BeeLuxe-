'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // In production, use Supabase auth:
      // const { error } = await supabase.auth.signInWithPassword({ email, password })
      await new Promise((r) => setTimeout(r, 800))
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            Demo: enter any credentials to enter
          </p>
        </div>
      </div>
    </div>
  )
}
