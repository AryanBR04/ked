"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";

export function YoutubeLessonPlayer({
  videoId,
  onCompleted,
  onError
}: {
  videoId: string;
  onCompleted: () => void;
  onError?: () => void;
}) {
  const [mode, setMode] = useState<"interactive" | "fallback">("interactive");
  const embedUrl = useMemo(() => `https://www.youtube.com/embed/${videoId}?rel=0`, [videoId]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMode("interactive");

    timeoutRef.current = window.setTimeout(() => {
      setMode((current) => (current === "interactive" ? "fallback" : current));
    }, 4000);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft">
      {mode === "interactive" ? (
        <YouTube
          key={videoId}
          videoId={videoId}
          className="aspect-video w-full"
          iframeClassName="h-full w-full"
          onReady={() => {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setMode("interactive");
          }}
          onEnd={onCompleted}
          onError={() => {
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
}
