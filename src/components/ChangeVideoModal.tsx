/**
 * Modal to replace the hero background video via local file upload or URL
 */

import React, { useState, useRef } from 'react';
import { formatVideoUrl } from '../utils/videoStorage';

interface ChangeVideoModalProps {
  currentUrl: string;
  isCustom: boolean;
  onClose: () => void;
  onSaveUrl: (url: string) => void;
  onSaveFile: (file: File) => void;
  onResetDefault: () => void;
}

export const ChangeVideoModal: React.FC<ChangeVideoModalProps> = ({
  currentUrl,
  isCustom,
  onClose,
  onSaveUrl,
  onSaveFile,
  onResetDefault,
}) => {
  const [urlInput, setUrlInput] = useState(isCustom && !currentUrl.startsWith('blob:') ? currentUrl : '');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please choose a valid video file (MP4, WebM, MOV).');
        return;
      }
      setError(null);
      onSaveFile(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please drop a valid video file (MP4, WebM, MOV).');
        return;
      }
      setError(null);
      onSaveFile(file);
      onClose();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a valid video link.');
      return;
    }
    const formatted = formatVideoUrl(urlInput);
    setError(null);
    onSaveUrl(formatted);
    onClose();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#fbf9f5] dark:bg-[#121215] border-[2.5px] border-[#18181b] dark:border-[#3f3f46] rounded-[24px] p-6 sm:p-8 transition-all"
      style={{
        boxShadow: '10px 12px 0px var(--shadow-3d-main)',
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-[#e5b364] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        aria-label="Close dialog"
      >
        ✕
      </button>

      <div className="text-center mb-6">
        <span className="text-[10px] font-mono uppercase bg-[#e5b364] px-2.5 py-0.5 rounded text-[#18181b] font-bold border border-[#18181b]">
          Hero Background
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#18181b] dark:text-[#f4f4f5] mt-2">
          Replace Background Video
        </h2>
        <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-1">
          Pick your local video file directly or paste any direct link / Google Drive share URL.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg">
          {error}
        </div>
      )}

      {/* Option 1: Direct File Upload / Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-5 ${
          dragActive
            ? 'border-[#e5b364] bg-amber-500/10'
            : 'border-[#18181b]/40 dark:border-neutral-700 bg-white dark:bg-[#18181b] hover:border-[#18181b] dark:hover:border-[#e5b364]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-2xl mb-1">🎬</div>
        <div className="text-xs font-mono font-bold text-[#18181b] dark:text-[#f4f4f5] uppercase">
          Choose or Drag & Drop Video File
        </div>
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
          Select the video file from your computer (MP4, WebM, MOV)
        </div>
        <div className="mt-3 inline-block text-[10px] font-mono uppercase bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] px-3 py-1 rounded font-bold">
          Browse Files ↗
        </div>
      </div>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-neutral-300 dark:border-neutral-800 w-full" />
        <span className="bg-[#fbf9f5] dark:bg-[#121215] px-3 text-[10px] font-mono text-neutral-400 uppercase">
          Or paste link
        </span>
        <div className="border-t border-neutral-300 dark:border-neutral-800 w-full" />
      </div>

      {/* Option 2: Paste URL */}
      <form onSubmit={handleUrlSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1">
            Video Link (Direct URL or Google Drive Share Link)
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://.../video.mp4 or https://drive.google.com/file/d/..."
            className="w-full text-xs font-mono p-2.5 bg-white dark:bg-[#18181b] border border-[#18181b] dark:border-[#3f3f46] text-[#18181b] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5b364]"
          />
        </div>

        <button
          type="submit"
          className="w-full btn-3d-dark h-9 rounded-lg border-2 border-[#18181b] dark:border-[#e5b364] bg-[#18181b] text-white font-mono text-xs uppercase font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          Apply Video Link →
        </button>
      </form>

      {/* Reset to Default */}
      {isCustom && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              onClose();
            }}
            className="text-[11px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 underline hover:opacity-75 cursor-pointer"
          >
            Reset to Original Video
          </button>
        </div>
      )}
    </div>
  );
};
