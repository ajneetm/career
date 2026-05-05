import { NextRequest, NextResponse } from 'next/server'

// Route protection is handled client-side in each protected page
// via supabase.auth.getUser()
export async function proxy(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*', '/admin/:path*'],
}
