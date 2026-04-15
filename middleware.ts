import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // CSP:
  // - script-src: Allow Google APIs, Vercel Live, Vercel Analytics.
  // - style-src: Allow Google Fonts, unsafe-inline.
  // - img-src: Allow data, blob, Google User Content.
  // - font-src: Allow Google Fonts.
  // - connect-src: Allow Firebase, Vercel Analytics.

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://vercel.live https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.googleusercontent.com https://lh3.googleusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://vitals.vercel-insights.com;
    frame-src 'self' https://*.firebaseapp.com https://*.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
  // Replace newlines with spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  // Anti-clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Anti-MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
