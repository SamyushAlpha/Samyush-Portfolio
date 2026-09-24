import React, { useEffect, useRef, useState, useCallback } from 'react';

interface HeroCanvasProps {
  progressRef: React.MutableRefObject<number>; // 0 to 1
  isCustomVideo: boolean;
  customVideoUrl?: string;
  onVideoDuration?: (d: number) => void;
  onCurrentTime?: (t: number) => void;
}

const TOTAL_FRAMES = 95;

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  progressRef,
  isCustomVideo,
  customVideoUrl,
  onVideoDuration,
  onCurrentTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Store preloaded frames
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [initialFrameReady, setInitialFrameReady] = useState(false);

  const lastDrawnFrameRef = useRef<number>(-1);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Math.min(window.innerWidth, window.innerHeight) < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Preload the supplied video’s WebP frames into memory (with background GPU decode for zero-jank scrubbing)
  useEffect(() => {
    if (isCustomVideo) return;

    let isMounted = true;

    // Helper to load and decode an image in background thread
    const loadFrame = (idx: number, isPriority = false) => {
      const img = new Image();
      img.src = `/hero-girl-frames/frame_${String(idx + 1).padStart(3, '0')}.webp`;
      
      const commit = () => {
        if (!isMounted) return;
        framesRef.current[idx] = img;
        lastDrawnFrameRef.current = -1;
        if (isPriority) {
          setInitialFrameReady(true);
        }
      };

      if ('decode' in img && typeof img.decode === 'function') {
        img.decode().then(commit).catch(commit);
      } else {
        img.onload = commit;
      }
    };

    // Load initial middle frame first for instant render (< 20ms)
    const midIdx = Math.floor(TOTAL_FRAMES / 2);
    loadFrame(midIdx, true);
    loadFrame(0);
    loadFrame(TOTAL_FRAMES - 1);

    // Preload remaining frames prioritized outward from center
    const order: number[] = [];
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      if (midIdx - offset >= 0) order.push(midIdx - offset);
      if (midIdx + offset < TOTAL_FRAMES) order.push(midIdx + offset);
    }

    const queuedFrames = order.filter(
      (idx) => idx !== 0 && idx !== TOTAL_FRAMES - 1 && idx !== midIdx
    );
    let batchTimer: number | undefined;
    const loadBatch = () => {
      queuedFrames.splice(0, 12).forEach((idx) => loadFrame(idx));
      if (queuedFrames.length > 0 && isMounted) {
        batchTimer = window.setTimeout(loadBatch, 20);
      }
    };
    loadBatch();

    return () => {
      isMounted = false;
      if (batchTimer !== undefined) window.clearTimeout(batchTimer);
    };
  }, [isCustomVideo]);

  // 2. High-DPI Canvas resize handler
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // 3. Draw the frame that directly matches the pointer position.
  useEffect(() => {
    if (isCustomVideo) return;

    let rafId: number;

    // Fast helper to get nearest available decoded frame
    const getBestFrame = (idx: number): { image: HTMLImageElement; index: number } | null => {
      const direct = framesRef.current[idx];
      if (direct && direct.complete && direct.naturalWidth > 0) return { image: direct, index: idx };
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = idx - offset;
        const next = idx + offset;
        if (prev >= 0) {
          const pImg = framesRef.current[prev];
          if (pImg && pImg.complete && pImg.naturalWidth > 0) return { image: pImg, index: prev };
        }
        if (next < TOTAL_FRAMES) {
          const nImg = framesRef.current[next];
          if (nImg && nImg.complete && nImg.naturalWidth > 0) return { image: nImg, index: next };
        }
      }
      return null;
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const requestedIndex = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, Math.round(progressRef.current * (TOTAL_FRAMES - 1)))
      );
      const frame = getBestFrame(requestedIndex);

      if (frame) {
        if (lastDrawnFrameRef.current === frame.index) {
          rafId = requestAnimationFrame(render);
          return;
        }
        lastDrawnFrameRef.current = frame.index;
        const floorImg = frame.image;
        const cw = canvas.width;
        const ch = canvas.height;
        const imgW = floorImg.naturalWidth;
        const imgH = floorImg.naturalHeight;
        const imgRatio = imgW / imgH;
        const canvasRatio = cw / ch;

        let rw = cw;
        let rh = ch;
        let rx = 0;
        let ry = 0;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than 16:9 (e.g. ultra-wide screens)
          rw = cw;
          rh = cw / imgRatio;
          rx = 0;
          ry = (ch - rh) * 0.5;
        } else {
          // Canvas is taller than 16:9 (mobile, tablet, standard desktop)
          rh = ch;
          rw = ch * imgRatio;

          const screenW = window.innerWidth;
          let desiredScreenRatio = 0.72; // Desktop default (character on right side)

          if (screenW < 640) {
            desiredScreenRatio = 0.52;
          } else if (screenW < 1024) {
            desiredScreenRatio = 0.62;
          }

          // In source video, the girl's center is at 54% (0.54) of the video width
          rx = (cw * desiredScreenRatio) - (rw * 0.54);

          // Clamping to avoid edge gaps
          if (rx + rw < cw) {
            rx = cw - rw;
          }
          ry = 0;
        }

        ctx.clearRect(0, 0, cw, ch);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 1. Primary Base Frame (100% opacity)
        ctx.globalAlpha = 1.0;
        // Extend the studio backdrop when positioning the subject beside the text.
        ctx.drawImage(floorImg, 0, 0, 1, imgH, 0, 0, cw, ch);
        ctx.drawImage(floorImg, rx, ry, rw, rh);

      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isCustomVideo, progressRef, initialFrameReady]);

  // 4. Custom video fallback handler (if user uploaded a custom MP4)
  useEffect(() => {
    if (!isCustomVideo || !customVideoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    const handleMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        onVideoDuration?.(video.duration);
        if (video.currentTime === 0) {
          video.currentTime = video.duration * 0.5;
        }
      }
    };

    video.addEventListener('loadedmetadata', handleMeta);
    video.addEventListener('durationchange', handleMeta);

    let rafId: number;
    const tick = () => {
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = progressRef.current * video.duration;
        const diff = Math.abs(video.currentTime - targetTime);
        if (diff > 0.02 && !video.seeking) {
          try {
            video.currentTime = targetTime;
          } catch {
            // ignore
          }
        }
        onCurrentTime?.(video.currentTime);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta);
      video.removeEventListener('durationchange', handleMeta);
      cancelAnimationFrame(rafId);
    };
  }, [isCustomVideo, customVideoUrl, progressRef, onVideoDuration, onCurrentTime]);

  return (
    <>
      {/* 120 FPS High-Performance Canvas for default sequence */}
      {!isCustomVideo && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            WebkitMaskImage: isMobile
              ? undefined
              : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 3%, rgba(0,0,0,0.85) 12%, black 22%)',
            maskImage: isMobile
              ? undefined
              : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 3%, rgba(0,0,0,0.85) 12%, black 22%)',
            filter: 'brightness(1.03) contrast(1.02)',
          }}
        />
      )}

      {/* Fallback Native Video Element for uploaded custom videos */}
      {isCustomVideo && (
        <video
          ref={videoRef}
          src={customVideoUrl}
          muted
          playsInline
          preload="auto"
          className="pointer-events-none fixed inset-0 z-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            objectPosition: isMobile ? '50% center' : '82% center',
            WebkitMaskImage: isMobile
              ? undefined
              : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 3%, rgba(0,0,0,0.85) 12%, black 22%)',
            maskImage: isMobile
              ? undefined
              : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 3%, rgba(0,0,0,0.85) 12%, black 22%)',
          }}
        />
      )}

      {/* Pristine Pure-White Studio Fade on Left Column (Desktop & Tablet) - moved 5% more left */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden md:block w-[32vw] lg:w-[25vw] max-w-[360px]"
        style={{
          background:
            'linear-gradient(to right, #ffffff 8%, rgba(255, 255, 255, 0.8) 28%, rgba(255, 255, 255, 0.08) 55%, transparent 100%)',
        }}
      />

      {/* Pure-White Bottom Fade for Mobile */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 block md:hidden h-[42vh] max-h-[330px]"
        style={{
          background:
            'linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.75) 45%, transparent 100%)',
        }}
      />
    </>
  );
};
