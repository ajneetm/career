import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/about', '/workshops', '/assessment', '/interests', '/career']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths and static files
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
      pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check session via cookie
  const token = req.cookies.get('sb-access-token')?.value ||
                req.cookies.getAll().find(c => c.name.includes('auth-token'))?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Admin protection
  if (pathname.startsWith('/admin')) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.auth.getUser(token)
    if (data.user?.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/user', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*'],
}
