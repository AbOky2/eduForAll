import { create } from 'zustand';

import type { ChildProfile } from '../domain/child-profile';

/**
 * Transient session state only — the profile row itself lives in SQLite.
 * Restored at bootstrap from app_settings.active_profile_id.
 */
interface ActiveProfileState {
  profile: ChildProfile | null;
  setProfile: (profile: ChildProfile | null) => void;
}

export const useActiveProfile = create<ActiveProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
