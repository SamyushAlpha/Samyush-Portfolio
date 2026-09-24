import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload } from '@vercel/blob/client';
import { authenticated, sameOrigin } from '../lib/auth.js';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const result = await handleUpload({ request: req, body: req.body,
      onBeforeGenerateToken: async pathname => {
        if (!sameOrigin(req) || !authenticated(req)) throw new Error('Unauthorized');
        if (!/^media\/[a-zA-Z0-9._-]+$/.test(pathname)) throw new Error('Invalid path');
        return { allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'], maximumSizeInBytes: 100 * 1024 * 1024, addRandomSuffix: true, allowOverwrite: false, validUntil: Date.now() + 10 * 60 * 1000 };
      },
    });
    return res.json(result);
  } catch { return res.status(400).json({ error: 'Upload failed. Sign in and choose a supported file under 100 MB.' }); }
}
