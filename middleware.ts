import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Subdomain rewrite so unlock.1moveacademy.com/<path> serves the
// /unlock/<path> route inside this Next.js app. API and static paths are
// passed through unchanged so the same handlers respond regardless of
// hostname (Next.js doesn't switch routing by host on its own — the
// rewrite normalizes the path so the unlock page renders for "/").
//
// All other hostnames (www.primeverseaccess.com, vercel preview URLs,
// etc.) fall through to NextResponse.next() and behave exactly as
// before — this middleware is additive.
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  if (host.startsWith('unlock.1moveacademy.com')) {
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/favicon')
    ) {
      return NextResponse.next()
    }
    url.pathname = `/unlock${url.pathname === '/' ? '' : url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
