import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect brain-related routes
  if (pathname.startsWith('/brain') || pathname.startsWith('/api/chat') || pathname.startsWith('/api/obsidian') || pathname.startsWith('/api/logs')) {
    const password = process.env.BRAIN_PASSWORD;

    // If no password is set, deny access by default for security
    if (!password) {
      if (!pathname.startsWith('/api/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'Brain password not configured on server');
        return NextResponse.redirect(url);
      }
      return new NextResponse(
        JSON.stringify({ error: 'BRAIN_PASSWORD environment variable is not set.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = request.headers.get('authorization');
    const cookiePassword = request.cookies.get('brain_password')?.value;

    // Check for Bearer token (API) or Cookie (UI)
    if (authHeader !== `Bearer ${password}` && cookiePassword !== password) {
      // If it's a browser page request (not an API request), redirect to login
      if (!pathname.startsWith('/api/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access to Second Brain. Please set brain_password cookie or Authorization header.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/brain/:path*', '/api/chat/:path*', '/api/obsidian/:path*', '/api/logs/:path*', '/api/brain/:path*'],
};
