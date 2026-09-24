/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Project } from '../types/project';
import { formatVideoUrl } from '../utils/videoStorage';

interface AdminModalProps {
  projects: Project[];
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id'>) => Promise<void>;
  onUpdateProject: (id: string, project: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  // Hero Video Management Props
  currentVideoUrl?: string;
  isCustomVideo?: boolean;
  onSaveVideoUrl?: (url: string) => Promise<void>;
  onSaveVideoFile?: (file: File) => Promise<void> | void;
  onResetVideoDefault?: () => Promise<void> | void;
  onUploadImage: (file: File) => Promise<string>;
}

// Curated high-aesthetic architecture presets for instant selection
const PRESET_COVERS = [
  {
    label: 'Dark Dashboard',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Neural Graph',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Code Architecture',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Fintech Engine',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  projects,
  onClose,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onResetDefaults,
  currentVideoUrl = '/hero-girl.mp4',
  isCustomVideo = false,
  onSaveVideoUrl,
  onSaveVideoFile,
  onResetVideoDefault,
  onUploadImage,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'video'>('manage');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Video Management State
  const [videoUrlInput, setVideoUrlInput] = useState(
    currentVideoUrl && !currentVideoUrl.startsWith('blob:') && isCustomVideo ? currentVideoUrl : ''
  );
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'fullstack' | 'realtime_ai' | 'frontend_motion'>('fullstack');
  const [tag, setTag] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [metrics, setMetrics] = useState('');
  const [year, setYear] = useState('2026');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [featured, setFeatured] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => setIsAuthenticated(Boolean(result.authenticated)))
      .finally(() => setAuthChecking(false));
  }, []);

  // Show transient notification
  const showToast = (msg: string) => {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 3000);
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(false);
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passcode }),
    });
    if (response.ok) {
      setIsAuthenticated(true);
    } else {
      setAuthError(true);
    }
  };

  // Image upload via FileReader
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Please choose an image under 5MB.');
        return;
      }
      try {
        setImagePreview(await onUploadImage(file));
        showToast('Project image uploaded. Save the project to publish it.');
      } catch {
        showToast('Image upload failed. Please sign in again and retry.');
      }
    }
  };

  const handleEditClick = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setTag(p.tag);
    setSummary(p.summary);
    setDescription(p.description);
    setTechInput(p.tech.join(', '));
    setMetrics(p.metrics || '');
    setYear(p.year);
    setLiveUrl(p.liveUrl || '');
    setGithubUrl(p.githubUrl || '');
    setImagePreview(p.imageUrl || '');
    setFeatured(Boolean(p.featured));
    setActiveTab('upload');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('fullstack');
    setTag('');
    setSummary('');
    setDescription('');
    setTechInput('');
    setMetrics('');
    setYear('2026');
    setLiveUrl('');
    setGithubUrl('');
    setImagePreview('');
    setFeatured(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload = {
      title,
      category,
      tag: tag.trim() || (category === 'fullstack' ? 'Full-Stack' : category === 'realtime_ai' ? 'Real-Time / AI' : 'Frontend & Motion'),
      summary,
      description,
      tech: techArray.length > 0 ? techArray : ['Full Stack', 'TypeScript'],
      metrics: metrics.trim() || undefined,
      year: year.trim() || '2026',
      liveUrl: liveUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      imageUrl: imagePreview || undefined,
      featured,
    };

    try {
      if (editingId) {
        await onUpdateProject(editingId, projectPayload);
        showToast(`Updated "${title}" for every visitor!`);
      } else {
        await onAddProject(projectPayload);
        showToast(`Published "${title}" for every visitor!`);
      }
      handleResetForm();
      setActiveTab('manage');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not publish project.');
    }
  };

  // Video Management Handlers
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setVideoError('Please choose a valid video file (MP4, WebM, MOV).');
        return;
      }
      setVideoError(null);
      setVideoLoading(true);
      try {
        await onSaveVideoFile?.(file);
        showToast('Hero background video uploaded and activated!');
      } catch {
        setVideoError('Failed to save video file.');
      } finally {
        setVideoLoading(false);
      }
    }
  };

  const handleVideoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setVideoDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setVideoError('Please drop a valid video file (MP4, WebM, MOV).');
        return;
      }
      setVideoError(null);
      setVideoLoading(true);
      try {
        await onSaveVideoFile?.(file);
        showToast('Hero background video uploaded and activated!');
      } catch {
        setVideoError('Failed to save video file.');
      } finally {
        setVideoLoading(false);
      }
    }
  };

  const handleVideoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      setVideoError('Please enter a valid video link.');
      return;
    }
    const formatted = formatVideoUrl(videoUrlInput);
    setVideoError(null);
    try {
      await onSaveVideoUrl?.(formatted);
      showToast('Hero video published for every visitor!');
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : 'Could not publish video.');
    }
  };

  const handleVideoReset = async () => {
    try {
      await onResetVideoDefault?.();
      setVideoUrlInput('');
      setVideoError(null);
      showToast('Reverted back to clean 120 FPS studio sequence!');
    } catch {
      setVideoError('Failed to reset video.');
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Close Button top-right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-[#e5b364] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer focus:outline-none"
        aria-label="Close admin panel"
      >
        ✕
      </button>

      {/* Outer Neobrutalist Shadow Box Wrapper */}
      <div
        className="w-full bg-[#fbf9f5] dark:bg-[#121215] border-[2.5px] sm:border-[3px] border-[#18181b] dark:border-[#3f3f46] rounded-[28px] sm:rounded-[36px] p-4 pt-16 sm:p-8 sm:pt-16 transition-all text-neutral-900 dark:text-neutral-100"
        style={{
          boxShadow: '12px 14px 0px var(--shadow-3d-main)',
        }}
      >
        {/* Passcode Security Gate */}
        {authChecking ? (
          <div className="py-12 text-center font-mono text-sm">Checking secure admin session…</div>
        ) : !isAuthenticated ? (
          <div className="py-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#18181b] dark:bg-[#121215] text-[#e5b364] flex items-center justify-center text-2xl mx-auto mb-4 border-2 border-[#18181b] dark:border-[#e5b364] shadow-[3px_3px_0px_var(--shadow-3d-main)]">
              🔒
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b] dark:text-[#f4f4f5] mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ADMIN STUDIO ACCESS
            </h2>
            <p className="text-xs font-mono text-[#71717a] dark:text-[#a1a1aa] mb-6">
              Restricted portal for Samyush Gautam to upload, modify, and manage production portfolio systems.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError(false);
                }}
                aria-label="Admin password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                className="w-full h-12 bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] text-[#18181b] dark:text-[#f4f4f5] text-center font-mono text-sm tracking-widest focus:outline-none focus:border-[#e5b364]"
                autoFocus
              />

              {authError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                  Incorrect password. Access denied.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-3d-gold w-full h-12 border-2 border-[#18181b] dark:border-[#e5b364] bg-[#e5b364] text-[#18181b] font-mono text-xs font-bold tracking-[0.24em] uppercase flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  Unlock Studio
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-2 font-bold">
                CONTROL CENTER
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-[#18181b] dark:text-[#f4f4f5] uppercase"
                style={{
                  fontFamily: 'var(--font-heading)',
                }}
              >
                WEBSITE ADMIN
              </h1>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.34em] uppercase text-[#3f3f46] dark:text-[#a1a1aa] mt-2">
                PROJECTS & BACKGROUND VIDEO
              </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="mb-5 bg-[#e5b364] text-[#18181b] border-2 border-[#18181b] px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider shadow-[3px_3px_0px_var(--shadow-3d-main)] flex items-center justify-between animate-fadeIn">
                <span>✓ {notification}</span>
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="text-xs font-bold cursor-pointer hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Admin Navigation Tabs */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#18181b]/15 dark:border-neutral-800 pb-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono tracking-[0.14em] uppercase border transition-all cursor-pointer font-bold ${
                    activeTab === 'upload'
                      ? 'btn-3d-dark bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] border-[#18181b]'
                      : 'btn-3d-white bg-white dark:bg-[#1c1c22] text-[#18181b] dark:text-[#e4e4e7] border-[#18181b]/30 dark:border-neutral-700'
                  }`}
                >
                  {editingId ? 'Edit Project' : '+ Upload Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono tracking-[0.14em] uppercase border transition-all cursor-pointer font-bold ${
                    activeTab === 'manage'
                      ? 'btn-3d-dark bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] border-[#18181b]'
                      : 'btn-3d-white bg-white dark:bg-[#1c1c22] text-[#18181b] dark:text-[#e4e4e7] border-[#18181b]/30 dark:border-neutral-700'
                  }`}
                >
                  Manage Catalog ({projects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono tracking-[0.14em] uppercase border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    activeTab === 'video'
                      ? 'btn-3d-dark bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] border-[#18181b]'
                      : 'btn-3d-white bg-white dark:bg-[#1c1c22] text-[#18181b] dark:text-[#e4e4e7] border-[#18181b]/30 dark:border-neutral-700'
                  }`}
                >
                  <span>🎬 Change Video</span>
                  {isCustomVideo && (
                    <span className="w-2 h-2 rounded-full bg-[#e5b364] animate-pulse inline-block" title="Custom video active" />
                  )}
                </button>
              </div>

              {activeTab === 'manage' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all projects back to original curated portfolio showcase?')) {
                      onResetDefaults()
                        .then(() => showToast('Published the default project catalog.'))
                        .catch((error) => showToast(error instanceof Error ? error.message : 'Could not reset projects.'));
                    }
                  }}
                  className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              )}
            </div>

            {/* Tab 1: Upload / Edit Form */}
            {activeTab === 'upload' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Project Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Distributed HyperScale Engine"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3 text-sm text-[#18181b] focus:outline-none cursor-pointer"
                    >
                      <option value="fullstack">Full-Stack</option>
                      <option value="realtime_ai">Real-Time & AI</option>
                      <option value="frontend_motion">Frontend & Motion</option>
                    </select>
                  </div>
                </div>

                {/* Tag label, Year, Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Display Tag
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. Full-Stack / WebSockets"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Year
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Key Metric / Badge
                    </label>
                    <input
                      type="text"
                      value={metrics}
                      onChange={(e) => setMetrics(e.target.value)}
                      placeholder="e.g. <20ms Latency"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                    Summary (One-Liner for Card Preview) *
                  </label>
                  <input
                    required
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="High-throughput collaborative infinite canvas engine with optimistic sync..."
                    className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                  />
                </div>

                {/* In-depth Description */}
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                    Full Case Study & Technical Architecture *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the system design, data flows, concurrency strategies, or front-end engineering choices..."
                    className="w-full bg-white border-2 border-[#18181b] rounded-none p-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none resize-y"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                    Technologies Used (Comma-Separated) *
                  </label>
                  <input
                    required
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="React 19, TypeScript, Node.js, WebSockets, PostgreSQL, Redis"
                    className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                  />
                </div>

                {/* Live URL & GitHub URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      Live Project URL
                    </label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-1.5">
                      GitHub Repository Link
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full h-11 bg-white border-2 border-[#18181b] rounded-none px-3.5 text-sm text-[#18181b] placeholder-[#a1a1aa] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cover Image Selection: Upload File or Quick Presets */}
                <div className="border-2 border-[#18181b] p-4 bg-white rounded-xl shadow-[3px_3px_0px_#18181b]">
                  <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-[#18181b] font-bold mb-2">
                    Project Cover Image (Upload or Pick Preset)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          id="project-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="project-file-upload"
                          className="btn-3d-dark h-10 px-4 border-2 border-[#18181b] bg-[#18181b] text-white font-mono text-xs tracking-wider uppercase font-bold flex items-center justify-center rounded-lg cursor-pointer"
                        >
                          📁 Browse From Device
                        </label>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-xs text-red-600 font-mono underline hover:text-red-800 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-[#71717a] font-mono">
                        PNG, JPG, or WEBP up to 5MB.
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="h-24 border-2 border-dashed border-[#18181b]/40 rounded-lg flex items-center justify-center bg-[#fbf9f5] overflow-hidden relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Project Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-xs text-[#a1a1aa] font-mono">
                          No cover selected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preset quick picker */}
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#71717a] mb-1.5">
                      Or Pick A Curated Production Visual Preset:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_COVERS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImagePreview(preset.url)}
                          className={`border rounded-lg p-1.5 text-left text-[11px] font-mono transition-all cursor-pointer flex items-center gap-2 ${
                            imagePreview === preset.url
                              ? 'border-[#18181b] bg-[#18181b] text-white'
                              : 'border-neutral-300 hover:border-black bg-[#fbf9f5]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#18181b] text-[#18181b] focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="featured-checkbox"
                    className="text-xs font-mono tracking-wider uppercase text-[#18181b] font-semibold cursor-pointer"
                  >
                    Mark as Featured Project
                  </label>
                </div>

                {/* Submit & Reset Buttons with 3D lift */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="submit"
                    className="btn-3d-gold flex-1 h-12 border-2 border-[#18181b] bg-[#e5b364] text-[#18181b] font-mono text-xs font-bold tracking-[0.24em] uppercase flex items-center justify-center cursor-pointer"
                  >
                    {editingId ? '✓ Save Changes' : '+ Upload Project To Portfolio'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="btn-3d-white h-12 px-6 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs font-bold tracking-[0.2em] uppercase cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Tab 2: Manage Existing Projects */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#71717a] uppercase tracking-wider flex justify-between items-center mb-2">
                  <span>Current Portfolio Artifacts</span>
                  <span>{projects.length} Total Systems</span>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border-2 border-[#18181b] p-4 rounded-xl shadow-[3px_3px_0px_#18181b] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div className="space-y-1 min-w-0 break-words">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-[#18181b]">
                            {p.title}
                          </span>
                          {p.featured && (
                            <span className="text-[10px] font-mono bg-[#e5b364] border border-[#18181b] text-[#18181b] px-1.5 py-0.2 rounded font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#52525b] line-clamp-1">
                          {p.summary}
                        </div>
                        <div className="text-[11px] font-mono text-[#71717a]">
                          {p.year} · {p.tag} · {p.tech.slice(0, 3).join(', ')}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="btn-3d-white px-3 min-h-11 py-1.5 border border-[#18181b] bg-[#f4f4f5] text-[#18181b] rounded text-xs font-mono font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        {deleteConfirmId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await onDeleteProject(p.id);
                                  setDeleteConfirmId(null);
                                  showToast(`Deleted "${p.title}" for every visitor.`);
                                } catch (error) {
                                  showToast(error instanceof Error ? error.message : 'Could not delete project.');
                                }
                              }}
                              className="px-3 min-h-11 py-1.5 border-2 border-red-700 bg-red-600 text-white rounded text-xs font-mono font-bold hover:bg-red-700 shadow-[2px_2px_0px_#7f1d1d] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 min-h-11 py-1.5 border border-[#18181b] bg-white text-[#18181b] rounded text-xs font-mono font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Cancel deletion"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="px-3 min-h-11 py-1.5 border border-red-600 bg-red-50 text-red-700 rounded text-xs font-mono font-bold hover:bg-red-600 hover:text-white active:scale-95 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      setActiveTab('upload');
                    }}
                    className="btn-3d-gold h-10 px-5 border-2 border-[#18181b] bg-[#e5b364] text-[#18181b] font-mono text-xs font-bold tracking-[0.2em] uppercase cursor-pointer"
                  >
                    + Add Another Project
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Hero Background Video Management */}
            {activeTab === 'video' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Status Box */}
                <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-5 shadow-[4px_4px_0px_var(--shadow-3d-main)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] dark:text-[#a1a1aa]">
                        Current Hero Scrubbing Sequence
                      </div>
                      <div className="text-lg font-bold text-[#18181b] dark:text-[#f4f4f5] flex items-center gap-2 mt-0.5">
                        {isCustomVideo ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e5b364]" />
                            <span>Custom Background Video Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span>Default 120 FPS Sequence Active (Watermark-Free)</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs font-mono text-[#52525b] dark:text-[#a1a1aa] mt-1 break-all">
                        Source:{' '}
                        <span className="text-[#18181b] dark:text-[#f4f4f5] font-medium">
                          {isCustomVideo
                            ? currentVideoUrl.startsWith('blob:')
                              ? 'Published shared video (private storage)'
                              : currentVideoUrl
                            : 'Girl interactive frames (/hero-girl.mp4)'}
                        </span>
                      </div>
                    </div>

                    {isCustomVideo && (
                      <button
                        type="button"
                        onClick={handleVideoReset}
                        className="btn-3d-white px-4 py-2 border-2 border-red-600 bg-red-50 text-red-700 text-xs font-mono font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        Reset to Original Video
                      </button>
                    )}
                  </div>
                </div>

                {videoError && (
                  <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-800 rounded-xl font-mono">
                    ⚠️ {videoError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Local Video Card */}
                  <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-5 shadow-[4px_4px_0px_var(--shadow-3d-main)] flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#18181b] dark:text-[#f4f4f5] mb-1">
                        1. Upload Video File
                      </div>
                      <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mb-4">
                        Upload an MP4, WebM, or MOV video. Saving publishes it for every website visitor.
                      </p>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setVideoDragActive(true);
                        }}
                        onDragLeave={() => setVideoDragActive(false)}
                        onDrop={handleVideoDrop}
                        onClick={() => videoFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          videoDragActive
                            ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 scale-[1.01]'
                            : 'border-[#18181b]/30 dark:border-neutral-700 bg-[#fbf9f5] dark:bg-[#121215] hover:border-[#18181b] dark:hover:border-[#e5b364]'
                        }`}
                      >
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoFileChange}
                        />
                        <div className="text-3xl mb-2">🎬</div>
                        <div className="text-xs font-mono font-bold text-[#18181b] dark:text-[#f4f4f5] uppercase">
                          {videoLoading ? 'Saving video...' : 'Drop Video File Here'}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                          MP4, WebM, MOV up to 100MB
                        </div>
                        <div className="mt-3 inline-block text-[10px] font-mono uppercase bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] px-3 py-1 rounded font-bold">
                          {videoLoading ? 'Processing...' : 'Browse Local Files ↗'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Or Paste Video URL Card */}
                  <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-5 shadow-[4px_4px_0px_var(--shadow-3d-main)] flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#18181b] dark:text-[#f4f4f5] mb-1">
                        2. Or Paste Video Link
                      </div>
                      <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mb-4">
                        Enter any direct MP4 link, CloudFront URL, or Google Drive sharing link.
                      </p>

                      <form onSubmit={handleVideoUrlSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#71717a] dark:text-[#a1a1aa] mb-1">
                            Direct Video URL / Google Drive
                          </label>
                          <input
                            type="url"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            placeholder="https://.../video.mp4 or https://drive.google.com/..."
                            className="w-full text-xs font-mono p-2.5 bg-[#fbf9f5] dark:bg-[#121215] border border-[#18181b] dark:border-[#3f3f46] text-[#18181b] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5b364]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-3d-dark w-full h-10 rounded-lg border-2 border-[#18181b] dark:border-[#e5b364] bg-[#18181b] text-white font-mono text-xs uppercase font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Apply Video Link →
                        </button>
                      </form>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      💡 Tip: Horizontal cursor & touch scrub physics work seamlessly on any video you choose!
                    </div>
                  </div>
                </div>

                {/* Live Scrub Preview inside Admin */}
                <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-5 shadow-[4px_4px_0px_var(--shadow-3d-main)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#18181b] dark:text-[#f4f4f5]">
                      Live Video Preview & Scrub Test
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">
                      Interactive Preview
                    </span>
                  </div>

                  <div className="relative aspect-video max-h-[260px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-[#18181b] dark:border-[#3f3f46]">
                    <video
                      ref={previewVideoRef}
                      src={currentVideoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    <span>Preview player: scrub the timeline above to test motion fluidity.</span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-black dark:text-[#e5b364] font-bold underline hover:opacity-75 cursor-pointer"
                    >
                      Return to Website View →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
