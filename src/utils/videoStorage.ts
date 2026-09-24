/**
 * IndexedDB helper for persisting custom hero video blobs and URLs
 */

const DB_NAME = 'samyush_portfolio_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_store';
const VIDEO_KEY = 'hero_background_video';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, VIDEO_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadSavedVideoBlob(): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VIDEO_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Failed to load video from IndexedDB:', e);
    return null;
  }
}

export async function clearSavedVideo(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(VIDEO_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Failed to clear video from IndexedDB:', e);
  }
}

/**
 * Transforms Google Drive share links into direct streaming URLs
 */
export function formatVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view...
  const gDriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
  }

  // Google Drive: id=FILE_ID
  const gDriveIdMatch = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && gDriveIdMatch && gDriveIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveIdMatch[1]}`;
  }

  // Dropbox: dl=0 -> dl=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}
