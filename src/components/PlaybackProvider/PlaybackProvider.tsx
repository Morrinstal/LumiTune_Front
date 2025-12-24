// PlaybackProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchTracks, fetchTrackById, fetchArtistById,
  fetchAudioBooks, fetchAudioBookById,
  fetchPodcasts, fetchPodcastById,
  fetchPlaylistById,
} from '../../api/services';

import type {
  Track, AudioBook, PodcastEpisode, ArtistLink, Playlist
} from '../../api/types';

import {
  getCurrentUserId,
  fetchFavoritesTracksFromDb,
  fetchFavoritesAudioBooksFromDb,
  fetchFavoritesPodcastsFromDb,
  addTrackToFavorites, removeTrackFromFavorites,
  addAudioBookToFavorites, removeAudioBookFromFavorites,
  addPodcastToFavorites, removePodcastFromFavorites,
} from '../../api/services';

type Mode = 'track' | 'audiobook' | 'podcast';

export type NowPlaying =
  | { kind: 'track';    track: Track;         artist: ArtistLink | null; playlist: Playlist | null }
  | { kind: 'audiobook';ab:    AudioBook;     author: ArtistLink | null }
  | { kind: 'podcast';  pc:    PodcastEpisode;host:   ArtistLink | null }
  | null;

type Favorites = {
  tracks:     Track[];
  podcasts:   PodcastEpisode[];
  audiobooks: AudioBook[];
};

type PlaybackState = {
  mode: Mode;
  currentId: string | null;
  src: string | null;
  img: string | null;
  title: string | null;
  byline: string | null;

  // очередь теперь строковая; numeric оставлен для обратной совместимости
  queue: { ids: string[]; numeric: number[] };
  currentNumericId: number | null;

  nowPlaying: NowPlaying;

  playTrack: (id: string) => Promise<void>;
  playAudioBook: (id: string) => Promise<void>;
  playPodcast: (id: string) => Promise<void>;
  playByNumeric: (numId: number) => Promise<void>;

  favorites: Favorites;
  isCurrentFavorite: boolean;
  toggleFavoriteCurrent: () => Promise<void>;
};

const Ctx = createContext<PlaybackState | null>(null);
export const usePlayback = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlayback must be used inside <PlaybackProvider/>');
  return ctx;
};

// маленький хелпер выбирает поле из нескольких
const pick = (...vals: (string | undefined | null)[]) =>
  vals.find(v => typeof v === 'string' && v.trim() !== '') ?? null;

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [audiobooks, setAudiobooks] = useState<AudioBook[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);

  const [mode, setMode] = useState<Mode>('track');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [byline, setByline] = useState<string | null>(null);

  // ВАЖНО: очередь только строковая
  const [queue, setQueue] = useState<{ ids: string[]; numeric: number[] }>({ ids: [], numeric: [] });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>(null);

  const [favorites, setFavorites] = useState<Favorites>({ tracks: [], podcasts: [], audiobooks: [] });

  const userId = getCurrentUserId();

  useEffect(() => {
    (async () => {
      const [t, ab, pc] = await Promise.all([fetchTracks(), fetchAudioBooks(), fetchPodcasts()]);
      setTracks(t);
      setAudiobooks(ab);
      setPodcasts(pc);

      // грузим все «любимые» из БД
      try {
        const [favTr, favAb, favPc] = await Promise.all([
          fetchFavoritesTracksFromDb(userId),
          fetchFavoritesAudioBooksFromDb(userId),
          fetchFavoritesPodcastsFromDb(userId),
        ]);
        setFavorites({
          tracks: favTr.tracks,
          audiobooks: favAb.audiobooks,
          podcasts: favPc.podcasts,
        });
      } catch (e) {
        console.error('Fav DB load error', e);
      }

      // автостарт
      if (!currentId && t[0]) {
        await playTrackInternal(String(t[0].id), t);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const currentNumericId = useMemo(() => {
    // Оставлено для совместимости, но не используется для API
    const n = Number(currentId);
    return Number.isFinite(n) ? n : null;
  }, [currentId]);

  // ---------- internals ----------
  const playTrackInternal = async (id: string, listOverride?: Track[]) => {
    const sid = String(id);
    const t = await fetchTrackById(sid);
    if (!t) return;

    setMode('track');
    setCurrentId(String(t.id));

    // берём первый доступный источник
    setSrc(pick((t as any).audio, (t as any).audio_url, (t as any).stream_url));
    setImg(pick((t as any).cover, (t as any).cover_image));
    setTitle(t.name || null);

    const artist = t.artistid ? await fetchArtistById(String(t.artistid)) : null;
    setByline(artist?.name ?? '');

    const list = listOverride ?? tracks;
    setQueue({
      ids: list.map(x => String(x.id)),
      numeric: [] // больше не используем
    });

    const playlist: Playlist | null =
      t.albumid ? (await fetchPlaylistById(String(t.albumid))) ?? null : null;

    setNowPlaying({ kind: 'track', track: t, artist: artist ?? null, playlist });
  };

  const playAudioBookInternal = async (id: string, listOverride?: AudioBook[]) => {
    const sid = String(id);
    const ab = audiobooks.find(x => String(x.id) === sid) ?? (await fetchAudioBookById(sid));
    if (!ab) return;

    const authorLink: ArtistLink | null = (ab as any).author_fk_id
      ? (await fetchArtistById(String((ab as any).author_fk_id))) ?? null
      : null;

    setMode('audiobook');
    setCurrentId(String(ab.id));
    setSrc(pick((ab as any).audio_file, (ab as any).audio_url, (ab as any).stream_url));
    setImg(pick((ab as any).cover_image, (ab as any).cover));
    setTitle(ab.title || null);
    setByline(authorLink?.name ?? (ab as any).author ?? '');

    const list = listOverride ?? audiobooks;
    setQueue({
      ids: list.map(x => String(x.id)),
      numeric: []
    });

    setNowPlaying({ kind: 'audiobook', ab, author: authorLink });
  };

  const playPodcastInternal = async (id: string, listOverride?: PodcastEpisode[]) => {
    const sid = String(id);
    const pc = podcasts.find(x => String(x.id) === sid) ?? (await fetchPodcastById(sid));
    if (!pc) return;

    const hostLink: ArtistLink | null = (pc as any).host_fk_id
      ? (await fetchArtistById(String((pc as any).host_fk_id))) ?? null
      : null;

    setMode('podcast');
    setCurrentId(String(pc.id));
    setSrc(pick((pc as any).audio_file, (pc as any).audio_url, (pc as any).stream_url));
    setImg(pick((pc as any).cover_image, (pc as any).cover));
    setTitle(pc.title || null);
    setByline(hostLink?.name ?? (pc as any).host ?? '');

    const list = listOverride ?? podcasts;
    setQueue({
      ids: list.map(x => String(x.id)),
      numeric: []
    });

    setNowPlaying({ kind: 'podcast', pc, host: hostLink });
  };

  // ---------- public API ----------
  const playTrack = async (id: string) => playTrackInternal(String(id));
  const playAudioBook = async (id: string) => playAudioBookInternal(String(id));
  const playPodcast = async (id: string) => playPodcastInternal(String(id));

  // Оставлено для обратной совместимости: принимает number, внутри сразу -> string
  const playByNumeric = async (numId: number) => {
    const id = String(numId);
    if (mode === 'track') await playTrackInternal(id);
    else if (mode === 'audiobook') await playAudioBookInternal(id);
    else await playPodcastInternal(id);
  };

  // ---------- favorites ----------
  const isCurrentFavorite = useMemo(() => {
    if (!currentId) return false;
    if (mode === 'track')     return favorites.tracks.some(x => String(x.id) === currentId);
    if (mode === 'audiobook') return favorites.audiobooks.some(x => String(x.id) === currentId);
    return favorites.podcasts.some(x => String(x.id) === currentId);
  }, [mode, currentId, favorites]);

  const toggleFavoriteCurrent = async () => {
    if (!currentId) return;

    if (mode === 'track') {
      const inFav = favorites.tracks.some(x => String(x.id) === currentId);
      if (inFav) {
        setFavorites(f => ({ ...f, tracks: f.tracks.filter(x => String(x.id) !== currentId) }));
        try { await removeTrackFromFavorites(userId, currentId); }
        catch (e) {
          console.error(e);
          const t = await fetchTrackById(currentId);
          if (t) setFavorites(f => ({ ...f, tracks: [t, ...f.tracks] }));
        }
      } else {
        const t = tracks.find(x => String(x.id) === currentId) ?? (await fetchTrackById(currentId));
        if (!t) return;
        setFavorites(f => ({ ...f, tracks: [t, ...f.tracks] }));
        try { await addTrackToFavorites(userId, currentId); }
        catch (e) {
          console.error(e);
          setFavorites(f => ({ ...f, tracks: f.tracks.filter(x => String(x.id) !== currentId) }));
        }
      }
      return;
    }

    if (mode === 'audiobook') {
      const inFav = favorites.audiobooks.some(x => String(x.id) === currentId);
      if (inFav) {
        setFavorites(f => ({ ...f, audiobooks: f.audiobooks.filter(x => String(x.id) !== currentId) }));
        try { await removeAudioBookFromFavorites(userId, currentId); }
        catch (e) {
          console.error(e);
          const ab = await fetchAudioBookById(currentId);
          if (ab) setFavorites(f => ({ ...f, audiobooks: [ab, ...f.audiobooks] }));
        }
      } else {
        const ab = audiobooks.find(x => String(x.id) === currentId) ?? (await fetchAudioBookById(currentId));
        if (!ab) return;
        setFavorites(f => ({ ...f, audiobooks: [ab, ...f.audiobooks] }));
        try { await addAudioBookToFavorites(userId, currentId); }
        catch (e) {
          console.error(e);
          setFavorites(f => ({ ...f, audiobooks: f.audiobooks.filter(x => String(x.id) !== currentId) }));
        }
      }
      return;
    }

    // podcast
    const inFav = favorites.podcasts.some(x => String(x.id) === currentId);
    if (inFav) {
      setFavorites(f => ({ ...f, podcasts: f.podcasts.filter(x => String(x.id) !== currentId) }));
      try { await removePodcastFromFavorites(userId, currentId); }
      catch (e) {
        console.error(e);
        const pc = await fetchPodcastById(currentId);
        if (pc) setFavorites(f => ({ ...f, podcasts: [pc, ...f.podcasts] }));
      }
    } else {
      const pc = podcasts.find(x => String(x.id) === currentId) ?? (await fetchPodcastById(currentId));
      if (!pc) return;
      setFavorites(f => ({ ...f, podcasts: [pc, ...f.podcasts] }));
      try { await addPodcastToFavorites(userId, currentId); }
      catch (e) {
        console.error(e);
        setFavorites(f => ({ ...f, podcasts: f.podcasts.filter(x => String(x.id) !== currentId) }));
      }
    }
  };

  const value: PlaybackState = {
    mode, currentId,
    src, img, title, byline,
    queue, currentNumericId,
    nowPlaying,
    playTrack, playAudioBook, playPodcast,
    playByNumeric,

    favorites,
    isCurrentFavorite,
    toggleFavoriteCurrent,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
