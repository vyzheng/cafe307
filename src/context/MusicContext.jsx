/**
 * Background music: one shared audio element, track switched by screen
 * (login, menu, archive, add_menu, notes, requests).
 * Playback starts after user interaction to satisfy browser autoplay policies.
 */

import { createContext, useContext, useRef, useCallback, useState } from "react";

/*
  TRACK_MAP — maps each screen name to a Ragnarok Online soundtrack file.
  Each screen has its own BGM so navigating between views feels like moving
  through different areas of a game world. Some screens share the same track
  (e.g. requests reuses the archive/Lutie theme).
*/
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
  /*
    Singleton audio element via useRef — we keep a single <audio> instance
    alive for the entire app lifetime. useRef (not useState) because changing
    the audio source shouldn't trigger a re-render; we just need a stable
    reference that persists across renders.
    currentTrackRef tracks which track key is loaded so setTrack can skip
    redundant loads when the user navigates to the same screen.
  */
  const audioRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [muted, setMuted] = useState(false);

  /* Lazily create the Audio element on first use */
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    return audioRef.current;
  }, []);

  /*
    setTrack — switches the background music to the track for the given screen.
    Skips if the requested track is already playing (avoids restarting the same
    song when a component re-renders). The .catch(() => {}) at the end
    suppresses the expected DOMException that browsers throw when autoplay is
    blocked — the music will start on the next user interaction via tryPlay.
  */
  const setTrack = useCallback((trackKey) => {
    const filename = TRACK_MAP[trackKey];
    if (!filename) return;
    const audio = getAudio();
    const src = `/music/${filename}`;
    /* Skip if we're already playing this track */
    if (currentTrackRef.current === trackKey && audio.src && audio.src.endsWith(filename)) {
      return;
    }
    currentTrackRef.current = trackKey;
    audio.src = src;
    audio.load();
    /* Don't auto-play if muted */
    if (!muted) {
      const p = audio.play();
      /* Suppress autoplay rejection — browser may block play() before user gesture */
      if (p && typeof p.catch === "function") {
        p.catch(() => {});
      }
    }
  }, [getAudio, muted]);

  /*
    tryPlay — called from event handlers (e.g. onFocus, onClick) to resume
    playback after a user interaction. Browsers block audio.play() until the
    user has interacted with the page (autoplay policy); calling tryPlay from
    a click/focus handler satisfies that requirement. The .catch(() => {})
    suppresses any remaining rejections gracefully.
  */
  const tryPlay = useCallback(() => {
    const audio = getAudio();
    if (audio.src && !muted) {
      audio.play().catch(() => {});
    }
  }, [getAudio, muted]);

  /* Toggle mute — pauses/resumes the audio and flips the muted flag */
  const toggleMute = useCallback(() => {
    const audio = getAudio();
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        audio.pause();
      } else if (audio.src) {
        audio.play().catch(() => {});
      }
      return next;
    });
  }, [getAudio]);

  return (
    <MusicContext.Provider value={{ setTrack, tryPlay, toggleMute, muted }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
