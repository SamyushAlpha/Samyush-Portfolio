/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project } from './types/project';
import { DEFAULT_PROJECTS } from './data/defaultProjects';
import { AboutModal } from './components/AboutModal';
import { ProjectsModal } from './components/ProjectsModal';
import { ContactModal } from './components/ContactModal';
import { AdminModal } from './components/AdminModal';
import { ChangeVideoModal } from './components/ChangeVideoModal';
import { HeroCanvas } from './components/HeroCanvas';
import { ThemeToggle } from './components/ThemeToggle';
import {
  saveVideoBlob,
  loadSavedVideoBlob,
  clearSavedVideo,
} from './utils/videoStorage';

// Custom useTypewriter hook:
// takes text, speed (default 38ms per char), startDelay (default 600ms)
// reveals one character at a time after delay
// returns { displayed, done }
export function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    setDone(false);

    const startTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);

      return () => window.clearInterval(interval);
    }, startDelay);

    return () => window.clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// Hero background scrub video URL (clean watermark-free local video)
export const HERO_VIDEO_URL =
  import.meta.env.VITE_HERO_VIDEO_URL || '/hero-girl.mp4';

type ModalType = 'about' | 'projects' | 'contact' | 'admin' | 'hello' | 'video' | null;

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0.5);

  // Active Video URL & custom status
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('samyush_custom_video_url');
      if (saved && !saved.includes('d8j0ntlcm91z4.cloudfront.net')) return saved;
    } catch (e) {
      // ignore
    }
    return HERO_VIDEO_URL;
  });
  const [isCustomVideo, setIsCustomVideo] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('samyush_custom_video_url');
      return Boolean(saved && !saved.includes('d8j0ntlcm91z4.cloudfront.net'));
    } catch {
      return false;
    }
  });

  // Check if there is an IndexedDB stored video file
  useEffect(() => {
    let objectUrl: string | null = null;
    loadSavedVideoBlob().then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setActiveVideoUrl(objectUrl);
        setIsCustomVideo(true);
      }
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  const handleSaveVideoUrl = (url: string) => {
    try {
      localStorage.setItem('samyush_custom_video_url', url);
    } catch (e) {
      console.error(e);
    }
    clearSavedVideo();
    setActiveVideoUrl(url);
    setIsCustomVideo(true);
  };

  const handleSaveVideoFile = async (file: File) => {
    try {
      await saveVideoBlob(file);
      const objUrl = URL.createObjectURL(file);
      localStorage.removeItem('samyush_custom_video_url');
      setActiveVideoUrl(objUrl);
      setIsCustomVideo(true);
    } catch (e) {
      console.error('Failed to store video file:', e);
    }
  };

  const handleResetVideoDefault = async () => {
    try {
      localStorage.removeItem('samyush_custom_video_url');
      await clearSavedVideo();
      setActiveVideoUrl(HERO_VIDEO_URL);
      setIsCustomVideo(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Theme State (light vs dark mode for low-light accessibility)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('samyush_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error(e);
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('samyush_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // UI States
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [helloMessage, setHelloMessage] = useState('');
  const [helloSent, setHelloSent] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Projects Catalog with persistent localStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('samyush_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading projects from storage:', e);
    }
    return DEFAULT_PROJECTS;
  });

  // Save to localStorage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem('samyush_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to storage:', e);
    }
  }, [projects]);

  // Project Admin Operations
  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const projectWithId: Project = {
      ...newProj,
      id: `proj_${Date.now()}`,
    };
    setProjects((prev) => [projectWithId, ...prev]);
  };

  const handleUpdateProject = (id: string, updated: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetDefaults = () => {
    setProjects(DEFAULT_PROJECTS);
    try {
      localStorage.removeItem('samyush_projects');
    } catch (e) {
      console.error(e);
    }
  };

  // Typewriter text
  const typewriterText =
    'Welcome\nMy name is\nSamyush Gautam\nFull Stack Developer';
  const { displayed, done } = useTypewriter(typewriterText, 32, 450);
  const typedLines = displayed.split('\n');
  const currentActiveLine = typedLines.length - 1;

  // Action pill buttons become visible 400ms after page load, independent of typing
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  // Initialize video metadata and set initial frame when activeVideoUrl changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setVideoDuration(video.duration);
        // Start near center (50%) if video is at start
        if (video.currentTime === 0) {
          const mid = video.duration * 0.5;
          targetTimeRef.current = mid;
          try {
            video.currentTime = mid;
          } catch {
            // ignore
          }
        }
      }
    };

    video.addEventListener('loadedmetadata', handleMeta);
    video.addEventListener('durationchange', handleMeta);
    video.addEventListener('canplay', handleMeta);

    if (video.readyState >= 1) {
      handleMeta();
    } else {
      try {
        video.load();
      } catch {
        // ignore
      }
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta);
      video.removeEventListener('durationchange', handleMeta);
      video.removeEventListener('canplay', handleMeta);
    };
  }, [activeVideoUrl]);

  // RequestAnimationFrame loop: continuously & smoothly drives video.currentTime to targetTimeRef
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        // Only set currentTime if not currently in a native seek to avoid frame drops
        if (!video.seeking) {
          const diff = Math.abs(video.currentTime - targetTimeRef.current);
          if (diff > 0.015) {
            try {
              if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
                (video as any).fastSeek(targetTimeRef.current);
              } else {
                video.currentTime = targetTimeRef.current;
              }
            } catch {
              // fallback
            }
          }
        }
        setCurrentTimeDisplay(video.currentTime);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Window-level mouse & touch scrub listener (maps cursor position across screen to video timeline)
  useEffect(() => {
    const handlePointerScrub = (clientX: number) => {
      // Don't scrub if user is interacting inside a modal
      if (activeModal !== null) return;

      const video = videoRef.current;
      const duration =
        video && Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : videoDuration > 0
          ? videoDuration
          : 3.5;

      // Ergonomic 3% margin so you can smoothly reach frame 0 and frame 96 without hitting screen bezels
      const margin = 0.03;
      const norm = (clientX / window.innerWidth - margin) / (1 - 2 * margin);
      const progress = Math.min(Math.max(norm, 0), 1);
      progressRef.current = progress;
      targetTimeRef.current = progress * duration;
    };

    const handlePointerMove = (e: PointerEvent) => {
      handlePointerScrub(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerScrub(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerScrub(e.touches[0].clientX);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) handlePointerScrub(e.touches[0].clientX);
    }, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeModal, videoDuration]);

  // Close modals on Escape key, and toggle Admin Panel on Shift+A or Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setMobileOpen(false);
      }
      // Secret Admin Hotkey: Shift + A or Alt + A
      if ((e.shiftKey || e.altKey) && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'admin' ? null : 'admin'));
      }
    };

    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        setActiveModal('admin');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    window.addEventListener('keydown', handleKeyDown);

    // Subtle developer console hint for Samyush
    console.info(
      '%c⚡ Samyush Gautam Admin Studio%c Press Shift+A or add #admin to the URL to upload and manage projects.',
      'background: #18181b; color: #e5b364; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-family: monospace;',
      'color: #52525b; margin-left: 8px; font-family: monospace;'
    );

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Copy email handler
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard
      .writeText('samyushgautam5@gmail.com')
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
  };

  const closeModal = () => {
    setActiveModal(null);
    setHelloSent(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-white dark:bg-[#09090b] transition-colors duration-200">
      {/* 120 FPS HARDWARE-ACCELERATED HERO CANVAS */}
      <div className="absolute inset-0 z-0">
        <HeroCanvas
          progressRef={progressRef}
          isCustomVideo={isCustomVideo}
          customVideoUrl={activeVideoUrl}
          onVideoDuration={setVideoDuration}
          onCurrentTime={setCurrentTimeDisplay}
        />
        {/* Atmospheric low-light ambient overlay for dark mode */}
        <div className="absolute inset-0 bg-neutral-950/70 transition-opacity duration-300 pointer-events-none opacity-0 dark:opacity-100" />
      </div>

      {/* NAVBAR (fixed, z-index: 20) */}
      <header className="fixed top-0 left-0 right-0 z-20 w-full px-5 sm:px-8 py-5 sm:py-6 flex justify-between items-center pointer-events-auto">
        {/* Brand Logo (left): Samyush Gautam (Double-click to open Admin) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {}}
            onDoubleClick={() => setActiveModal('admin')}
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-neutral-900 dark:text-neutral-100 cursor-pointer hover:opacity-75 transition-colors whitespace-nowrap focus:outline-none"
            title="Samyush Gautam"
          >
            Samyush Gautam
          </button>
        </div>

        {/* Desktop nav links: ABOUT, PROJECTS, CONTACT, ADMIN, THEME TOGGLE */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] sm:text-[14px] font-semibold tracking-[0.22em] uppercase text-neutral-900 dark:text-neutral-200"
          style={{ fontFamily: 'var(--font-heading)' }}
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => setActiveModal('about')}
            className="hover:opacity-60 dark:hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none"
          >
            ABOUT
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('projects')}
            className="hover:opacity-60 dark:hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none"
          >
            PROJECTS
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('contact')}
            className="hover:opacity-60 dark:hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none"
          >
            CONTACT
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('admin')}
            className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none flex items-center gap-1.5"
            title="Admin & Hero Video Management"
          >
            <span>ADMIN</span>
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </nav>

        {/* Mobile top-right: Theme Toggle + Hamburger button */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] cursor-pointer focus:outline-none z-20 text-neutral-900 dark:text-neutral-100"
          >
            <span
              className={`w-6 h-[2px] bg-current block transition-all duration-300 transform origin-center ${
                mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-current block transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-current block transition-all duration-300 transform origin-center ${
                mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY (z-index: 15) */}
      <div
        className={`fixed inset-0 bg-[#fbf9f5]/98 dark:bg-[#0d0d10]/98 backdrop-blur-md z-[15] flex flex-col justify-center items-start px-8 gap-8 md:hidden transition-all duration-300 ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setActiveModal('about');
          }}
          className="text-[26px] font-normal tracking-[0.2em] uppercase text-black dark:text-white hover:opacity-60 transition-opacity text-left cursor-pointer"
        >
          ABOUT
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setActiveModal('projects');
          }}
          className="text-[26px] font-normal tracking-[0.2em] uppercase text-black dark:text-white hover:opacity-60 transition-opacity text-left cursor-pointer"
        >
          PROJECTS
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setActiveModal('contact');
          }}
          className="text-[26px] font-normal tracking-[0.2em] uppercase text-black dark:text-white hover:opacity-60 transition-opacity text-left cursor-pointer"
        >
          CONTACT
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setActiveModal('admin');
          }}
          className="text-[26px] font-normal tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:opacity-60 transition-opacity text-left cursor-pointer flex items-center gap-3"
        >
          <span>ADMIN</span>
          <span className="text-xs font-mono uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
            Video & Projects
          </span>
        </button>

        <a
          href="https://www.instagram.com/samyush_gautam/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[26px] font-normal tracking-[0.2em] uppercase text-black dark:text-white hover:opacity-60 transition-opacity text-left cursor-pointer flex items-center gap-3"
        >
          <span>INSTAGRAM</span>
          <span className="text-xs font-mono uppercase bg-pink-100 dark:bg-pink-950/50 text-[#E1306C] dark:text-[#f472b6] border border-[#E1306C]/30 px-2 py-0.5 rounded">
            @samyush_gautam ↗
          </span>
        </a>

        <div className="w-full pt-6 border-t border-neutral-300 dark:border-neutral-800">
          <ThemeToggle theme={theme} onToggle={toggleTheme} showLabel className="w-full justify-center py-2.5" />
        </div>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <main className="h-screen w-full flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden relative z-[1]">
        {/* Content container */}
        <div className="max-w-md sm:max-w-lg md:max-w-[480px] lg:max-w-[540px] relative z-10">
          {/* Stacked Hero Text (Welcome / My name is / Samyush Gautam / Full Stack Developer) */}
          <div
            className="mb-4 sm:mb-6 select-none flex flex-col items-start"
            style={{
              fontFamily: 'var(--font-heading)',
              minHeight: '160px',
            }}
          >
            {/* Line 1: Welcome */}
            {typedLines[0] !== undefined && (
              <div className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-800 dark:text-neutral-200 tracking-[-0.01em] leading-snug">
                {typedLines[0]}
                {!done && currentActiveLine === 0 && (
                  <span
                    className="inline-block w-[2.5px] h-[0.9em] bg-neutral-900 dark:bg-neutral-100 align-middle ml-[3px] cursor-blink"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}

            {/* Line 2: My name is */}
            {typedLines[1] !== undefined && (
              <div className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-800 dark:text-neutral-200 tracking-[-0.01em] leading-snug mt-0.5">
                {typedLines[1]}
                {!done && currentActiveLine === 1 && (
                  <span
                    className="inline-block w-[2.5px] h-[0.9em] bg-neutral-900 dark:bg-neutral-100 align-middle ml-[3px] cursor-blink"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}

            {/* Line 3: Samyush Gautam (Bigger font for high visibility and prominence) */}
            {typedLines[2] !== undefined && (
              <div className="text-[32px] sm:text-[40px] md:text-[48px] font-black text-neutral-950 dark:text-white tracking-[-0.03em] leading-[1.08] my-1 sm:my-1.5 drop-shadow-sm dark:drop-shadow-[0_2px_14px_rgba(255,255,255,0.2)]">
                <span>{typedLines[2]}</span>
                {!done && currentActiveLine === 2 && (
                  <span
                    className="inline-block w-[3.5px] h-[0.85em] bg-neutral-950 dark:bg-white align-middle ml-[4px] cursor-blink"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}

            {/* Line 4: Full Stack Developer */}
            {typedLines[3] !== undefined && (
              <div className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-neutral-700 dark:text-neutral-300 tracking-[-0.01em] leading-snug">
                {typedLines[3]}
                {!done && currentActiveLine === 3 && (
                  <span
                    className="inline-block w-[2.5px] h-[0.9em] bg-neutral-900 dark:bg-neutral-100 align-middle ml-[3px] cursor-blink"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>

          {/* 3. Action pill buttons (Tactile 3D Hover Lift) */}
          <div
            className={`flex flex-wrap gap-y-1 ${
              pillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            style={{
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 3D pill buttons */}
            <button
              type="button"
              onClick={() => setActiveModal('projects')}
              className="pill-3d-white inline-flex items-center justify-center border rounded-full text-[13px] sm:text-[15px] font-medium px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer"
            >
              My Projects ({projects.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="pill-3d-white inline-flex items-center justify-center border rounded-full text-[13px] sm:text-[15px] font-medium px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer"
            >
              About Me
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('contact')}
              className="pill-3d-white inline-flex items-center justify-center border rounded-full text-[13px] sm:text-[15px] font-medium px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer"
            >
              Contact Me
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('hello')}
              className="pill-3d-white inline-flex items-center justify-center border rounded-full text-[13px] sm:text-[15px] font-medium px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap cursor-pointer"
            >
              Send a brief hello
            </button>

            {/* 1 outline 3D pill button: samyushgautam5@gmail.com */}
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy samyushgautam5@gmail.com"
              className="pill-3d-outline border-2 rounded-full text-[13px] sm:text-[15px] font-medium px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap inline-flex items-center justify-center gap-2 sm:gap-3 cursor-pointer group"
            >
              <span>
                Reach me:{' '}
                <span className="underline underline-offset-2 font-semibold">
                  samyushgautam5@gmail.com
                </span>
              </span>
              {/* 12x12 copy icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                <rect
                  x="3.5"
                  y="1.5"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <rect
                  x="1.5"
                  y="3.5"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </button>
          </div>

          {/* Copy feedback badge */}
          <div
            className={`mt-2 transition-all duration-300 text-xs tracking-tight ${
              copied
                ? 'opacity-100 translate-y-0 text-black dark:text-emerald-400 font-semibold'
                : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            ✓ Copied samyushgautam5@gmail.com to clipboard
          </div>
        </div>
      </main>

      {/* Minimal Footer & Bottom-Right Instagram Link */}
      <footer className="fixed bottom-3 left-5 right-5 sm:left-8 sm:right-8 z-20 flex justify-between items-center pointer-events-none text-[11px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tight">
        <div className="flex items-center gap-1.5 opacity-70 select-none">
          <span>© {new Date().getFullYear()} Samyush Gautam</span>
          <span className="hidden md:inline">• Full Stack Developer</span>
        </div>

        {/* Instagram Logo Button (Bottom Right) */}
        <div className="pointer-events-auto flex items-center">
          <a
            href="https://www.instagram.com/samyush_gautam/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram profile: @samyush_gautam"
            title="Follow Samyush Gautam on Instagram (@samyush_gautam)"
            className="group relative inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border-2 border-[#18181b] dark:border-[#e5b364] bg-white dark:bg-[#18181b] text-[#18181b] dark:text-[#f4f4f5] shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:shadow-[3.5px_3.5px_0px_var(--shadow-3d-main)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b364] select-none"
          >
            {/* Instagram Camera SVG Icon */}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 transition-transform duration-200 group-hover:scale-110 text-[#18181b] dark:text-[#f4f4f5] group-hover:text-[#E1306C] dark:group-hover:text-[#e5b364]"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span className="text-[11px] font-mono font-bold tracking-tight hidden sm:inline-block">
              @samyush_gautam
            </span>
          </a>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL SYSTEM: ABOUT, PROJECTS, CONTACT, ADMIN, HELLO, VIDEO */}
      {/* ========================================================================= */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-3xl transition-transform duration-300 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal: CHANGE HERO VIDEO */}
            {activeModal === 'video' && (
              <ChangeVideoModal
                currentUrl={activeVideoUrl}
                isCustom={isCustomVideo}
                onClose={closeModal}
                onSaveUrl={handleSaveVideoUrl}
                onSaveFile={handleSaveVideoFile}
                onResetDefault={handleResetVideoDefault}
              />
            )}
            {/* Modal: ABOUT */}
            {activeModal === 'about' && (
              <AboutModal
                onClose={closeModal}
                onOpenContact={() => setActiveModal('contact')}
                onOpenProjects={() => setActiveModal('projects')}
              />
            )}

            {/* Modal: PROJECTS */}
            {activeModal === 'projects' && (
              <ProjectsModal
                projects={projects}
                onClose={closeModal}
                onOpenAdmin={() => setActiveModal('admin')}
                onOpenContact={() => setActiveModal('contact')}
              />
            )}

            {/* Modal: CONTACT */}
            {activeModal === 'contact' && (
              <ContactModal
                onClose={closeModal}
                onCopyEmail={handleCopyEmail}
                copied={copied}
              />
            )}

            {/* Modal: ADMIN PANEL (Projects & Hero Background Video) */}
            {activeModal === 'admin' && (
              <AdminModal
                projects={projects}
                onClose={closeModal}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onResetDefaults={handleResetDefaults}
                currentVideoUrl={activeVideoUrl}
                isCustomVideo={isCustomVideo}
                onSaveVideoUrl={handleSaveVideoUrl}
                onSaveVideoFile={handleSaveVideoFile}
                onResetVideoDefault={handleResetVideoDefault}
              />
            )}

            {/* Modal: Send a brief hello */}
            {activeModal === 'hello' && (
              <div
                className="bg-[#fbf9f5] dark:bg-[#121215] border-[2.5px] border-[#18181b] dark:border-[#3f3f46] rounded-[28px] p-6 sm:p-10 relative transition-all"
                style={{
                  boxShadow: '12px 14px 0px var(--shadow-3d-main)',
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-[#18181b] border-2 border-black dark:border-[#e5b364] text-black dark:text-white flex items-center justify-center text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shadow-[2px_2px_0px_var(--shadow-3d-main)]"
                >
                  ✕
                </button>
                <div className="text-center mb-6">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                    Direct Line
                  </div>
                  <h2
                    className="text-3xl font-bold tracking-tight text-[#18181b] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Send a brief hello
                  </h2>
                </div>

                {helloSent ? (
                  <div className="py-6 text-center">
                    <p className="text-base font-medium mb-2 text-neutral-800 dark:text-neutral-200">
                      “Thanks for saying hello! Glad you stopped by my portfolio.”
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 font-mono">
                      — Samyush Gautam (Full Stack Developer)
                    </p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-3d-dark px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold border-2 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setHelloSent(true);
                    }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Drop a quick greeting or ask what I'm building today. Always excited to connect!
                    </p>
                    <textarea
                      required
                      rows={3}
                      value={helloMessage}
                      onChange={(e) => setHelloMessage(e.target.value)}
                      placeholder="Say hello or ask anything..."
                      className="w-full bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] text-[#18181b] dark:text-[#f4f4f5] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e5b364] resize-none rounded-xl"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        className="btn-3d-gold border-2 border-[#18181b] dark:border-[#e5b364] text-[#18181b] px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-bold cursor-pointer"
                      >
                        Transmit →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
