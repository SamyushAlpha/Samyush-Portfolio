import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';
const COOKIE = 'portfolio_admin';
const equal = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const sign = (value: string) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(value).digest('hex');
export function authenticated(req: VercelRequest) {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const value = req.cookies?.[COOKIE] || (req.headers.cookie || '').split('; ').find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!value) return false;
  const [expires, signature] = value.split('.');
  return Number(expires) > Date.now() && Boolean(signature) && equal(sign(expires), signature);
}
export function sameOrigin(req: VercelRequest) {
  return req.headers.origin === `https://${req.headers.host}`;
}
export function validPassword(password: unknown) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return typeof password === 'string' && password.length <= 256 && Boolean(hash) && equal(createHash('sha256').update(password).digest('hex'), hash!);
}
export function sessionCookie(logout = false) {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${COOKIE}=${logout ? '' : expires + '.' + sign(expires)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${logout ? 0 : 28800}`;
}
