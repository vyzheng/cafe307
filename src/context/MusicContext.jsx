/**
 * Background music: one shared audio element, track switched by screen (login, menu, archive, add_menu, notes).
 * Playback starts after user interaction to satisfy browser autoplay policies.
 */

import { createContext, useContext, useRef, useCallback } from "react";

const TRACK_MAP = {
  login: "login_ragnarokonline_title.mp3",
  menu: "currentMenu_ragnarokonline_prontera.mp3",
  archive: "archive_ragnarokonline_lutie.mp3",
  add_menu: "newMenu_ragnarokonline_noviceground.mp3",
  notes: "notes_ragnarokonline_morroc.mp3",
  requests: "archive_ragnarokonline_lutie.mp3",
};

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const currentTrackRef = useRef(null);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    return audioRef.current;
  }, []);

  const setTrack = useCallback((trackKey) => {
    const filename = TRACK_MAP[trackKey];
    if (!filename) return;
    const audio = getAudio();
    const src = `/music/${filename}`;
    if (currentTrackRef.current === trackKey && audio.src && audio.src.endsWith(filename)) {
      return;
    }
    currentTrackRef.current = trackKey;
    audio.src = src;
    audio.load();
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }, [getAudio]);

  const tryPlay = useCallback(() => {
    const audio = getAudio();
    if (audio.src) {
      audio.play().catch(() => {});
    }
  }, [getAudio]);

  return (
    <MusicContext.Provider value={{ setTrack, tryPlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
