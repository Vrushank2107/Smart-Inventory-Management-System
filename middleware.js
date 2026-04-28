import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const startTime = Date.now();

  // Check authentication for protected routes
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/');
  const isPublicRoute = pathname === '/' || pathname.startsWith('/_next') || pathname.includes('.');
  
  // Protect all routes except auth pages and home page
  if (!isAuthRoute && !isPublicRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Create response
  const response = NextResponse.next();
  
  // Set CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Log response time
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
