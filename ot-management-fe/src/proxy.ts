import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
/** Where an authenticated user lands when they have no explicit destination. */
const HOME_PATH = '/dashboard';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // Root → route by auth state.
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = hasToken ? HOME_PATH : '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user on a public (auth) page → send into the app.
  if (isPublic && hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_PATH;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Unauthenticated user on a protected page → send to login with redirect back.
  if (!isPublic && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
