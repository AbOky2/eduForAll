import { create } from 'zustand';

/** Mirrors app_settings rows; SQLite stays the source of truth. */
interface SettingsState {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  soundEnabled: true,
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
}));
