import { get, put } from '@vercel/blob';
import { DEFAULT_PROJECTS } from '../src/data/defaultProjects.js';
export const CONTENT_PATH = 'site/content.json';
export async function readSite() {
  const result = await get(CONTENT_PATH, { access: 'private', useCache: false });
  if (!result || !result.stream) return { projects: DEFAULT_PROJECTS, videoUrl: null, revision: null };
  const content = await new Response(result.stream).json();
  return { ...content, revision: result.blob.etag };
}
export async function writeSite(content: any, revision: string | null) {
  const blob = await put(CONTENT_PATH, JSON.stringify(content), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false,
    ...(revision ? { ifMatch: revision } : { allowOverwrite: false }),
  });
  return { ...content, revision: blob.etag };
}
export function validUrl(value: unknown, media = false) {
  if (value === undefined || value === '' || value === null) return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (media && /^\/api\/media\?path=media%2F[a-zA-Z0-9%._-]+$/.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
export function validateContent(body: any) {
  if (!body || !Array.isArray(body.projects) || body.projects.length > 100 || !validUrl(body.videoUrl, true)) return false;
  const ids = new Set();
  return body.projects.every((p: any) => {
    if (!p || typeof p.id !== 'string' || ids.has(p.id)) return false;
    ids.add(p.id);
    return ['id', 'title', 'tag', 'summary', 'description', 'year'].every(k => typeof p[k] === 'string' && p[k].length <= 20000) && p.title.trim().length > 0 &&
      ['fullstack', 'realtime_ai', 'frontend_motion'].includes(p.category) && Array.isArray(p.tech) && p.tech.length <= 50 && p.tech.every((v: any) => typeof v === 'string' && v.length <= 100) &&
      validUrl(p.liveUrl) && validUrl(p.githubUrl) && validUrl(p.imageUrl, true) && (p.metrics === undefined || typeof p.metrics === 'string') && (p.featured === undefined || typeof p.featured === 'boolean');
  });
}
