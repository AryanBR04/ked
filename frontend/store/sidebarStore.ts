"use client";

import { create } from "zustand";
import type { SubjectTreeResponse } from "@/lib/types";

interface SidebarState {
  tree: SubjectTreeResponse | null;
  loading: boolean;
  error: string | null;
  setTree: (tree: SubjectTreeResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markVideoCompleted: (videoId: number) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  tree: null,
  loading: false,
  error: null,
  setTree: (tree) => set({ tree }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  markVideoCompleted: (videoId) =>
    set((state) => {
      if (!state.tree) {
        return state;
      }

      const orderedVideos = state.tree.sections.flatMap((section) => section.videos);
      const currentIndex = orderedVideos.findIndex((video) => video.id === videoId);
      const nextVideoId = currentIndex >= 0 ? orderedVideos[currentIndex + 1]?.id : undefined;

      return {
        tree: {
          ...state.tree,
          sections: state.tree.sections.map((section) => ({
            ...section,
            videos: section.videos.map((video) =>
              video.id === videoId
                ? { ...video, is_completed: true, locked: false }
                : video.id === nextVideoId
                  ? { ...video, locked: false }
                  : video
            )
          }))
        }
      };
    })
}));
