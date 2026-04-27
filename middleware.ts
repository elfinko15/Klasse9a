import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Pfade die ohne Login erreichbar sind
const PUBLIC = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/me']

// Pfade die trotz Passwort-Pflicht erlaubt sind
const ALLOW_CHANGE_PW = ['/change-password', '/api/auth/change-password', '/api/auth/logout', '/api/auth/me']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('session')?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session.mustChangePassword && !ALLOW_CHANGE_PW.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/change-password', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
