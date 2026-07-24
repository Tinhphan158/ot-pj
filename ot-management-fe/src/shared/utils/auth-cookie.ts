import Cookies from 'js-cookie';

export const ACCESS_TOKEN_COOKIE = 'access_token';

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
