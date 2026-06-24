export type GameMusicTrack = "menu" | "hub" | "visual-novel";

export const GAME_MUSIC_TRACKS: Record<GameMusicTrack, string> = {
  menu: "/audio/close_to_you.m4a",
  hub: "/audio/weird_woods.mp3",
  "visual-novel": "/audio/tingri.mp3",
};

export const GAME_MUSIC_ENABLED_KEY = "game_music_enabled";
export const GAME_MUSIC_VOLUME_KEY = "game_music_volume";

export function readMusicEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(GAME_MUSIC_ENABLED_KEY);
  return stored === null ? true : stored === "true";
}

export function readMusicVolume(): number {
  if (typeof window === "undefined") return 0.6;
  const stored = localStorage.getItem(GAME_MUSIC_VOLUME_KEY);
  if (stored === null) return 0.6;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.6;
}
