import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  GAME_MUSIC_ENABLED_KEY,
  GAME_MUSIC_TRACKS,
  GAME_MUSIC_VOLUME_KEY,
  readMusicEnabled,
  readMusicVolume,
  type GameMusicTrack,
} from "@/lib/game-audio-tracks";

type GameAudioContextValue = {
  track: GameMusicTrack | null;
  setTrack: (track: GameMusicTrack) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playSfx: (type: "jump" | "text" | "little") => void;
};

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedSrcRef = useRef<string | null>(null);
  const [track, setTrackState] = useState<GameMusicTrack | null>(null);
  const [musicEnabled, setMusicEnabledState] = useState(readMusicEnabled);
  const [volume, setVolumeState] = useState(readMusicVolume);
  const [sfxEnabled, setSfxEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("game_sfx_enabled");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const src = GAME_MUSIC_TRACKS[track];
    if (loadedSrcRef.current !== src) {
      loadedSrcRef.current = src;
      audio.src = src;
      audio.load();
    }

    audio.volume = volume;

    if (musicEnabled) {
      void audio.play().catch(() => {
        // Browsers block autoplay until the user interacts with the page.
      });
    } else {
      audio.pause();
    }
  }, [track, musicEnabled, volume]);

  const setTrack = useCallback((nextTrack: GameMusicTrack) => {
    setTrackState(nextTrack);
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    localStorage.setItem(GAME_MUSIC_ENABLED_KEY, String(enabled));
  }, []);

  const setSfxEnabled = useCallback((enabled: boolean) => {
    setSfxEnabledState(enabled);
    localStorage.setItem("game_sfx_enabled", String(enabled));
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(clamped);
    localStorage.setItem(GAME_MUSIC_VOLUME_KEY, String(clamped));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const playSfx = useCallback((type: "jump" | "text" | "little") => {
    if (!sfxEnabled) return;
    const src = type === "jump" ? "/audio/jump.wav" : type === "text" ? "/audio/text.wav" : "/audio/little.wav";
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  }, [sfxEnabled, volume]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!sfxEnabled) return;

      let target = e.target as HTMLElement | null;
      let isClickable = false;
      let skipJump = false;

      while (target && target !== document.body) {
        if (target.getAttribute?.("data-no-jump-sfx") === "true") {
          skipJump = true;
        }

        const tagName = target.tagName?.toLowerCase();
        const role = target.getAttribute?.("role");
        const cursor = window.getComputedStyle(target).cursor;

        if (
          tagName === "button" ||
          tagName === "a" ||
          tagName === "input" ||
          tagName === "select" ||
          role === "button" ||
          target.classList?.contains("cursor-pointer") ||
          cursor === "pointer"
        ) {
          isClickable = true;
        }
        target = target.parentElement;
      }

      if (isClickable && !skipJump) {
        const audio = new Audio("/audio/jump.wav");
        audio.volume = volume;
        audio.play().catch(() => {});
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, [sfxEnabled, volume]);

  return (
    <GameAudioContext.Provider
      value={{
        track,
        setTrack,
        musicEnabled,
        setMusicEnabled,
        sfxEnabled,
        setSfxEnabled,
        volume,
        setVolume,
        playSfx,
      }}
    >
      {children}
    </GameAudioContext.Provider>
  );
}

export function useGameAudio() {
  const context = useContext(GameAudioContext);
  if (!context) {
    throw new Error("useGameAudio must be used within GameAudioProvider");
  }
  return context;
}

export function SetGameMusicTrack({ track }: { track: GameMusicTrack }) {
  const { setTrack } = useGameAudio();

  useEffect(() => {
    setTrack(track);
  }, [track, setTrack]);

  return null;
}
