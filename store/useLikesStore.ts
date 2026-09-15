import { create } from "zustand";

interface LikeState {
  currentUserId: string | null; // currently logged in user
  likes: Record<string, { liked: boolean; count: number }>; // per post
  setUser: (userId: string | null) => void;
  setLike: (postId: string, liked: boolean, count: number) => void;
  toggleLike: (postId: string) => void;
  resetLikes: () => void;
}

export const useLikesStore = create<LikeState>((set, get) => ({
  currentUserId: null,
  likes: {},

  setUser: (userId) =>
    set((state) => {
      // Like state is viewer-specific. Keep it across token refreshes for the
      // same account, but never carry it into a signed-out or different-user
      // session.
      if (state.currentUserId === userId) {
        return state;
      }

      return { currentUserId: userId, likes: {} };
    }),

  resetLikes: () => set({ likes: {} }),

  setLike: (postId, liked, count) =>
    set((state) => ({
      likes: {
        ...state.likes,
        [postId]: { liked, count },
      },
    })),

  toggleLike: (postId) =>
    set((state) => {
      const prev = state.likes[postId];
      if (!prev) return state;
      return {
        likes: {
          ...state.likes,
          [postId]: {
            liked: !prev.liked,
            count: prev.count + (prev.liked ? -1 : 1),
          },
        },
      };
    }),
}));
