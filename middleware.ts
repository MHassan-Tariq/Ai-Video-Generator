import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // To fully protect routes server-side with Firebase, 
  // you'd need to set up Firebase Admin and session cookies or verify tokens.
  // For a client-side heavy admin panel, we rely heavily on AuthContext 
  // (which redirects if not auth'd).
  //
  // However, we can do a simple check: if no auth token is in cookies/storage 
  // (if you set one), or we just let AuthContext handle the redirect immediately on load.
  // For simplicity without Firebase Admin SDK, we'll let the layout/AuthContext handle it.
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
