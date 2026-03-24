/**
 * /offline — Shown by the service worker when the user is offline and the
 * requested page isn't in the cache yet.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white p-8 text-center">
      <div className="text-7xl mb-6">🐝</div>
      <h1 className="text-2xl font-bold text-[#fbbf24] mb-3">You're offline</h1>
      <p className="text-[#94a3b8] max-w-xs leading-relaxed mb-8">
        No internet connection right now. Your schedule and checklist for
        today were saved for offline use — check back in a moment!
      </p>
      <a
        href="/portal"
        className="px-6 py-3 bg-[#fbbf24] text-[#1a1a2e] font-bold rounded-xl"
      >
        Try Again
      </a>
    </div>
  )
}
