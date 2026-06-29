// store/profileRefreshStore.ts

import { create } from "zustand";

type ProfileRefreshStore = {
  shouldRefreshProfile: boolean;
  requestProfileRefresh: () => void;
  clearProfileRefresh: () => void;
};

export const useProfileRefreshStore = create<ProfileRefreshStore>((set) => ({
  shouldRefreshProfile: false,
  requestProfileRefresh: () => set({ shouldRefreshProfile: true }),
  clearProfileRefresh: () => set({ shouldRefreshProfile: false }),
}));
