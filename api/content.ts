import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticated, sameOrigin } from '../lib/auth.js';
import { readSite, writeSite, validateContent } from '../lib/site.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await readSite());
    if (req.method !== 'PUT') return res.status(405).end();
    if (!sameOrigin(req) || !authenticated(req)) return res.status(401).json({ error: 'Please sign in again.' });
    if (!validateContent(req.body)) return res.status(400).json({ error: 'Check project fields and use HTTPS links.' });
    const current = await readSite();
    if (current.revision !== req.body.revision) return res.status(409).json({ error: 'The website changed in another tab. Reload before saving.' });
    return res.json(await writeSite({ projects: req.body.projects, videoUrl: req.body.videoUrl || null }));
  } catch (e) {
    console.error('Content operation failed', e instanceof Error ? `${e.name}: ${e.message}` : 'unknown');
    return res.status(503).json({ error: 'Could not save or load website content. Please try again.' });
  }
}
