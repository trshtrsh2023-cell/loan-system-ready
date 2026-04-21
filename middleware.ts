import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname === '/' || 
    pathname.startsWith('/api/auth') ||
    pathname === '/api/admin/init' ||
    pathname === '/api/banks' ||
    pathname === '/api/products'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value
  if (!token) return NextResponse.redirect(new URL('/', req.url))

  const user = await verifyToken(token)
  if (!user) return NextResponse.redirect(new URL('/', req.url))

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (user.role !== 'admin') return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname === '/calculator') {
    if (user.status !== 'approved') return NextResponse.redirect(new URL('/pending', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/calculator', '/admin/:path*', '/pending', '/api/admin/:path*', '/api/logs']
}