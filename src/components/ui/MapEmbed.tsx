'use client'

/**
 * MapEmbed — Leaflet + OpenStreetMap (100% free, no API key)
 *
 * Replaces the "open in Google Maps" external link with an inline map showing
 * a pin at the job address.  Geocoding is done via Nominatim (OSM's free
 * geocoding service, no key required).
 *
 * Usage:
 *   <MapEmbed address="4823 Westheimer Rd" city="Houston" state="TX" />
 *
 * NOTE: Leaflet must run client-side only.  This component uses dynamic import
 * internally so the server bundle is never polluted with browser-only code.
 */

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { MapPin, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'

interface Props {
  address: string
  city:    string
  state?:  string
  /** Height of the map container (default 200px) */
  height?: number
}

interface LatLng { lat: number; lng: number }

// Nominatim geocode — free, no key, ~1 req/sec rate limit (fine for on-demand)
async function geocode(address: string, city: string, state = 'TX'): Promise<LatLng | null> {
  const q = encodeURIComponent(`${address}, ${city}, ${state}, USA`)
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'User-Agent': 'BeeLuxeCleaners/1.0 dispatch@beeluxecleaners.com' } }
    )
    const data = await res.json() as Array<{ lat: string; lon: string }>
    if (!data[0]) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

// ── Lazy-load the heavy Leaflet component (browser only) ───────────────────────
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr:     false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-luxe-50 rounded-xl">
      <Loader2 size={20} className="animate-spin text-luxe-400" />
    </div>
  ),
})

// ── Main component ─────────────────────────────────────────────────────────────
export function MapEmbed({ address, city, state = 'TX', height = 200 }: Props) {
  const [coords,  setCoords]  = useState<LatLng | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    geocode(address, city, state).then((result) => {
      if (result) {
        setCoords(result)
      } else {
        setError(true)
      }
      setLoading(false)
    })
  }, [address, city, state])

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, ${state}`)}`

  return (
    <div className="rounded-xl overflow-hidden border border-luxe-100" style={{ height }}>
      {loading && (
        <div className="flex items-center justify-center h-full bg-luxe-50">
          <Loader2 size={18} className="animate-spin text-luxe-400" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-full bg-luxe-50 gap-2 p-4">
          <AlertTriangle size={18} className="text-amber-400" />
          <p className="text-xs text-luxe-500 text-center">Map unavailable</p>
          <a
            href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <MapPin size={11} /> Open in Google Maps <ExternalLink size={10} />
          </a>
        </div>
      )}

      {!loading && !error && coords && (
        <LeafletMap
          lat={coords.lat}
          lng={coords.lng}
          label={`${address}, ${city}, ${state}`}
          height={height}
        />
      )}
    </div>
  )
}
