"use client";

import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";

export interface YoutubeLessonPlayerHandle {
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number) => void;
}

export const YoutubeLessonPlayer = forwardRef<YoutubeLessonPlayerHandle, {
  videoId: string;
  onCompleted: () => void;
  onError?: () => void;
  /** Called periodically with (currentTime, duration) */
  onProgress?: (current: number, duration: number) => void;
}>(({
  videoId,
  onCompleted,
  onError,
  onProgress
}, ref) => {
  const [mode, setMode] = useState<"interactive" | "fallback">("interactive");
  const embedUrl = useMemo(() => `https://www.youtube.com/embed/${videoId}?rel=0`, [videoId]);
  const timeoutRef = useRef<number | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getCurrentTime: async () => {
      if (playerRef.current) {
        return playerRef.current.getCurrentTime();
      }
      return 0;
    },
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, true);
      }
    }
  }));

  // Reset completion flag when video changes
  useEffect(() => {
    completedRef.current = false;
    setMode("interactive");

    timeoutRef.current = window.setTimeout(() => {
      setMode((current) => (current === "interactive" ? "fallback" : current));
    }, 4000);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [videoId]);

  function startProgressPolling() {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(async () => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const current: number = await player.getCurrentTime();
        const duration: number = await player.getDuration();
        if (duration > 0) {
          onProgress?.(current, duration);
          if (!completedRef.current && current / duration >= 0.9) {
            completedRef.current = true;
            onCompleted();
          }
        }
      } catch {
        // player may not be ready yet
      }
    }, 3000);
  }

  function stopProgressPolling() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-black shadow-soft">
      {mode === "interactive" ? (
        <YouTube
          key={videoId}
          videoId={videoId}
          className="aspect-video w-full"
          iframeClassName="h-full w-full"
          onReady={(e: YouTubeEvent) => {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            playerRef.current = e.target;
            setMode("interactive");
          }}
          onPlay={() => startProgressPolling()}
          onPause={() => stopProgressPolling()}
          onEnd={() => {
            stopProgressPolling();
            if (!completedRef.current) {
              completedRef.current = true;
              onCompleted();
            }
          }}
          onError={() => {
            stopProgressPolling();
            setMode("fallback");
            onError?.();
          }}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              rel: 0,
              modestbranding: 1
            }
          }}
        />
      ) : (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="YouTube lesson player"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
});
