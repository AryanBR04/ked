"use client";

import { create } from "zustand";

interface VideoState {
  currentVideoId: number | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isCompleted: boolean;
  previousVideoId: number | null;
  nextVideoId: number | null;
  setCurrentVideo: (input: {
    videoId: number;
    duration: number;
    isCompleted: boolean;
    previousVideoId: number | null;
    nextVideoId: number | null;
  }) => void;
  setCurrentTime: (seconds: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  markCompleted: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  previousVideoId: null,
  nextVideoId: null,
  setCurrentVideo: (input) =>
    set({
      currentVideoId: input.videoId,
      duration: input.duration,
      isCompleted: input.isCompleted,
      previousVideoId: input.previousVideoId,
      nextVideoId: input.nextVideoId
    }),
  setCurrentTime: (seconds) => set({ currentTime: seconds }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  markCompleted: () => set({ isCompleted: true })
}));

