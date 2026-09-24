import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticated, sameOrigin, sessionCookie, validPassword } from '../lib/auth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.json({ authenticated: authenticated(req) });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Request not allowed.' });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', sessionCookie(true)); return res.json({ authenticated: false }); }
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) return res.status(503).json({ error: 'Admin sign-in is not configured.' });
  if (!validPassword(req.body?.password)) { await new Promise(r => setTimeout(r, 600)); return res.status(401).json({ error: 'Incorrect password.' }); }
  res.setHeader('Set-Cookie', sessionCookie());
  return res.json({ authenticated: true });
}
