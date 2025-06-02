import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const host = request.headers.get('host') || ''
  
  // Remove www. prefix if present
  const cleanHost = host.replace(/^www\./, '')
  
  console.log(`🌐 Middleware: ${cleanHost}${pathname}`)

  // 🏠 Main domain redirect to landing page
  if (cleanHost === 'agentesdeconversao.ai') {
    if (pathname === '/') {
      return NextResponse.redirect('https://lp.agentesdeconversao.ai')
    }
    // Allow direct paths on main domain for now
    return NextResponse.next()
  }

  // 🎨 Landing Page (lp.agentesdeconversao.ai)
  if (cleanHost === 'lp.agentesdeconversao.ai') {
    // Allow all landing page routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth')) {
      return NextResponse.redirect(`https://dash.agentesdeconversao.ai${pathname}`)
    }
    return NextResponse.next()
  }

  // 📊 Dashboard (dash.agentesdeconversao.ai)  
  if (cleanHost === 'dash.agentesdeconversao.ai') {
    // Check authentication for dashboard routes
    const token = request.cookies.get('supabase-auth-token')?.value ||
                  request.headers.get('authorization')
    
    // Public dashboard routes that don't require auth
    const publicRoutes = ['/auth/login', '/auth/signup', '/auth/reset-password', '/auth/verify-email']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    if (!token && !isPublicRoute && !pathname.startsWith('/auth/')) {
      return NextResponse.redirect('https://login.agentesdeconversao.ai/auth/login')
    }
    
    // Redirect non-dashboard routes to appropriate subdomains
    if (pathname === '/' || pathname.startsWith('/about') || pathname.startsWith('/pricing')) {
      return NextResponse.redirect(`https://lp.agentesdeconversao.ai${pathname}`)
    }
    
    return NextResponse.next()
  }

  // 🔐 Authentication (login.agentesdeconversao.ai)
  if (cleanHost === 'login.agentesdeconversao.ai') {
    // Only allow auth routes on login subdomain
    if (!pathname.startsWith('/auth/')) {
      return NextResponse.redirect('/auth/login')
    }
    
    // Check if user is already authenticated
    const token = request.cookies.get('supabase-auth-token')?.value
    if (token && pathname === '/auth/login') {
      return NextResponse.redirect('https://dash.agentesdeconversao.ai/dashboard')
    }
    
    return NextResponse.next()
  }

  // 📖 Documentation (docs.agentesdeconversao.ai)
  if (cleanHost === 'docs.agentesdeconversao.ai') {
    // Redirect to docs path or external docs service
    if (pathname === '/') {
      return NextResponse.redirect('/docs')
    }
    return NextResponse.next()
  }

  // 🔌 API (api.agentesdeconversao.ai) - This should be handled by Railway
  if (cleanHost === 'api.agentesdeconversao.ai') {
    // This middleware shouldn't handle API requests
    // They should go directly to Railway backend
    return NextResponse.next()
  }

  // Default: allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}