import type { VercelRequest, VercelResponse } from '@vercel/node';
import { get } from '@vercel/blob';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { readSite } from '../lib/site.js';
import { authenticated } from '../lib/auth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const path = req.query.path;
  if (typeof path !== 'string' || !/^media\/[a-zA-Z0-9._-]+$/.test(path)) return res.status(404).end();
  try {
    const url = '/api/media?path=' + encodeURIComponent(path);
    const site = await readSite();
    if (site.videoUrl !== url && !site.projects.some((p: any) => p.imageUrl === url) && !authenticated(req)) return res.status(404).end();
    const upstream = await get(path, { access: 'private', useCache: true, headers: req.headers.range ? { Range: req.headers.range } : undefined });
    if (!upstream || upstream.statusCode !== 200) return res.status(404).end();
    res.status(Number(upstream.headers.get('content-range') ? 206 : 200));
    for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag']) { const value = upstream.headers.get(name); if (value) res.setHeader(name, value); }
    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!upstream.stream || req.method === 'HEAD') return res.end();
    await pipeline(Readable.fromWeb(upstream.stream as any), res);
  } catch { if (!res.headersSent) res.status(404).end(); else res.end(); }
}
