import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/_next', '/favicon']
const CHANGE_PW_PATHS = ['/change-password', '/api/auth/change-password', '/api/auth/me', '/api/auth/logout']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Öffentliche Pfade immer erlauben
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = req.cookies.get('session')?.value
  const session = token ? await verifySessionToken(token) : null

  // Nicht eingeloggt → Login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Muss Passwort ändern → nur /change-password und zugehörige APIs erlauben
  if (session.mustChangePassword && !CHANGE_PW_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/change-password', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
