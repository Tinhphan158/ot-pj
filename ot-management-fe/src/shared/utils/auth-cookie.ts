import Cookies from 'js-cookie';

/**
 * App-specific name: cookies are shared by every app on the same host (ports
 * don't isolate them), and other internal apps already use `access_token`.
 * Keep in sync with `src/proxy.ts`.
 */
export const ACCESS_TOKEN_COOKIE = 'ot_access_token';

export function setAccessTokenCookie(token: string) {
  Cookies.set(ACCESS_TOKEN_COOKIE, token, {
    expires: 7,
    sameSite: 'lax',
    path: '/',
  });
}

export function removeAccessTokenCookie() {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
}
