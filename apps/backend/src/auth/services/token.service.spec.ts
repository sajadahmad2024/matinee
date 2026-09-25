import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { EnvConfig } from '@config/env.config';
import { TokenService } from './token.service';

type Env = Partial<Record<'COOKIE_SAMESITE' | 'COOKIE_SECURE' | 'COOKIE_DOMAIN' | 'JWT_ACCESS_TTL', unknown>>;

function build(env: Env): TokenService {
  const config = { get: (key: string) => (env as Record<string, unknown>)[key] } as unknown as ConfigService<EnvConfig>;
  return new TokenService({} as JwtService, config);
}

function fakeRes() {
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  return { res: { cookie, clearCookie } as unknown as Response, cookie, clearCookie };
}

/** Options passed for a given cookie name on the mocked `res.cookie` / `res.clearCookie`. */
function optsFor(mock: jest.Mock, name: string): Record<string, unknown> {
  const call = mock.mock.calls.find((c: unknown[]) => c[0] === name);
  if (!call) {
    throw new Error(`cookie ${name} not set`);
  }
  // res.cookie(name, value, opts) vs res.clearCookie(name, opts)
  return (call.length === 3 ? call[2] : call[1]) as Record<string, unknown>;
}

describe('TokenService cookie options', () => {
  const pair = { accessToken: 'a', refreshToken: 'r' };

  it('defaults to lax access / strict refresh, COOKIE_SECURE and COOKIE_DOMAIN respected', () => {
    const svc = build({ COOKIE_SECURE: false, COOKIE_DOMAIN: 'localhost' });
    const { res, cookie } = fakeRes();
    svc.setAuthCookies(res, pair, 60);

    expect(optsFor(cookie, 'access_token')).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax', domain: 'localhost', path: '/' });
    expect(optsFor(cookie, 'refresh_token')).toMatchObject({ httpOnly: true, secure: false, sameSite: 'strict', maxAge: 60_000 });
  });

  it('strict applies to access and refresh', () => {
    const svc = build({ COOKIE_SAMESITE: 'strict' });
    expect(svc.cookieOptions('access').sameSite).toBe('strict');
    expect(svc.cookieOptions('refresh').sameSite).toBe('strict');
    expect(svc.cookieOptions('csrf').sameSite).toBe('strict');
  });

  it('none forces secure=true on every auth cookie (even with COOKIE_SECURE=false) and relaxes refresh', () => {
    const svc = build({ COOKIE_SAMESITE: 'none', COOKIE_SECURE: false, COOKIE_DOMAIN: 'api.example.com' });
    const { res, cookie } = fakeRes();
    svc.setAuthCookies(res, pair, 60);
    const csrf = svc.setCsrfCookie(res);

    for (const name of ['access_token', 'refresh_token', 'csrf']) {
      expect(optsFor(cookie, name)).toMatchObject({ sameSite: 'none', secure: true, domain: 'api.example.com' });
    }
    expect(optsFor(cookie, 'csrf')['httpOnly']).toBe(false);
    expect(csrf).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie.mock.calls.find((c: unknown[]) => c[0] === 'csrf')?.[1]).toBe(csrf);
  });

  it('falls back to lax for unknown values', () => {
    expect(build({ COOKIE_SAMESITE: 'bogus' }).cookieSameSite).toBe('lax');
    expect(build({ COOKIE_SAMESITE: 'NONE' }).cookieSameSite).toBe('none');
  });

  it('clears access/refresh/csrf with the same attributes they were set with', () => {
    const svc = build({ COOKIE_SAMESITE: 'none', COOKIE_DOMAIN: '.example.com' });
    const { res, clearCookie } = fakeRes();
    svc.clearAuthCookies(res);

    expect(optsFor(clearCookie, 'access_token')).toEqual(svc.cookieOptions('access'));
    expect(optsFor(clearCookie, 'refresh_token')).toEqual(svc.cookieOptions('refresh'));
    expect(optsFor(clearCookie, 'csrf')).toEqual(svc.cookieOptions('csrf'));
    expect(optsFor(clearCookie, 'csrf')).toMatchObject({ sameSite: 'none', secure: true, domain: '.example.com' });
  });
});
