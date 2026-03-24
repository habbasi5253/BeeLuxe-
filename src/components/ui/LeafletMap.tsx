'use client'

/**
 * LeafletMap — internal component, loaded dynamically (no SSR).
 * Always import via MapEmbed.tsx which handles the dynamic() wrapper.
 *
 * Uses react-leaflet v5 + OpenStreetMap tiles (no API key required).
 */

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet's default marker icon in webpack/Next.js builds
// (icons use a URL that the bundler breaks without this override)
const markerIcon = L.icon({
  iconUrl:        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1,  -34],
  shadowSize:  [41, 41],
})

interface Props {
  lat:    number
  lng:    number
  label:  string
  height: number
}

// Re-centres the map when lat/lng props change (e.g. user switches job)
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true })
  }, [lat, lng, map])
  return null
}

export default function LeafletMap({ lat, lng, label, height }: Props) {
  return (
    <>
      {/* Leaflet CSS — must be in a <style> or global sheet; dynamic import handles this client-side */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{label}</Popup>
        </Marker>
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </>
  )
}
