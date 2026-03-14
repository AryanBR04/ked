"use client";

import React, { useEffect, useMemo, useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";

function extractVideoId(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }

    return url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return youtubeUrl;
  }
}

export function VideoPlayer({
  youtubeUrl,
  startPositionSeconds,
  onProgress,
  onCompleted
}: {
  youtubeUrl: string;
  startPositionSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const videoId = useMemo(() => extractVideoId(youtubeUrl), [youtubeUrl]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  function clearTimer() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    intervalRef.current = window.setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
      onProgress(Math.floor(currentTime));
    }, 5000);
  }

  function handleReady(event: YouTubeEvent<any>) {
    playerRef.current = event.target;

    if (startPositionSeconds > 0) {
      event.target.seekTo(startPositionSeconds, true);
    }
  }

  function handleStateChange(event: YouTubeEvent<any>) {
    const playerState = event.data;

    if (playerState === 1) {
      startTimer();
    }

    if (playerState === 2) {
      clearTimer();
      const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
      onProgress(Math.floor(currentTime));
    }

    if (playerState === 0) {
      clearTimer();
      onCompleted();
    }
  }

  return (
    <div className="overflow-hidden rounded-4xl border border-ink/10 bg-white shadow-soft">
      <YouTube
        videoId={videoId}
        className="aspect-video w-full"
        iframeClassName="h-full w-full"
        onReady={handleReady}
        onStateChange={handleStateChange}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            rel: 0,
            start: startPositionSeconds
          }
        }}
      />
    </div>
  );
}

