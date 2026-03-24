import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title:       'BeeLuxe Cleaners — Business-in-a-Box',
  description: 'AI-powered platform to automate and scale your cleaning company',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'BeeLuxe',
    startupImage:   '/icons/icon-512.svg',
  },
  icons: {
    icon: [
      { url: '/icons/icon-72.svg',  sizes: '72x72',   type: 'image/svg+xml' },
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

// Separate viewport export (Next.js 14+ requirement)
export const viewport: Viewport = {
  themeColor:        '#fbbf24',
  width:             'device-width',
  initialScale:      1,
  maximumScale:      1,
  userScalable:      false,
  viewportFit:       'cover',     // fills iPhone notch / Dynamic Island
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}

        {/* Service worker registration — runs after hydration, never blocks render */}
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(function(reg) {
                  console.log('[BeeLuxe SW] registered:', reg.scope);
                })
                .catch(function(err) {
                  console.warn('[BeeLuxe SW] registration failed:', err);
                });
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
