import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect brain-related routes
  if (pathname.startsWith('/brain') || pathname.startsWith('/api/chat') || pathname.startsWith('/api/obsidian') || pathname.startsWith('/api/logs')) {
    const authHeader = request.headers.get('authorization');
    const password = process.env.BRAIN_PASSWORD;

    // If no password is set, allow access (for initial setup)
    if (!password) return NextResponse.next();

    // Check for "Bearer <password>" or a custom header/cookie
    if (authHeader !== `Bearer ${password}`) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access to Second Brain' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/brain/:path*', '/api/chat/:path*', '/api/obsidian/:path*', '/api/logs/:path*', '/api/brain/:path*'],
};
