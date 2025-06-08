import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Subdomain routing for production
  if (hostname.startsWith('lp.')) {
    return NextResponse.rewrite(new URL(`/landing${pathname}`, request.url))
  }
  
  if (hostname.startsWith('dash.')) {
    return NextResponse.rewrite(new URL(`/dashboard${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}