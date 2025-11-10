import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected paths
  const protectedPaths = ['/app', '/admin'];
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Define public paths that should always be accessible
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/auth', '/api', '/about', '/docs'];
  const isPublicPath = publicPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // If user is not authenticated and is trying to access a protected path
  if (!session && isProtectedPath && !isPublicPath) {
    // Redirect to login page
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes require admin role
  if (req.nextUrl.pathname.startsWith('/admin') && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    // Check if account is explicitly disabled (is_active === false)
    if (profile && profile.is_active === false) {
      return NextResponse.redirect(new URL('/account-disabled', req.url));
    }

    // Check if user is admin
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Update last_sign_in_at when user accesses the app
  if (session && isProtectedPath) {
    // Update last sign in time (fire and forget)
    void supabase
      .from('profiles')
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq('id', session.user.id);
  }

  // If user is authenticated and trying to access login/signup pages
  if (session && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/signup')) {
    // Redirect to chat
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return res;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
