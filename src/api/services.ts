import { api } from './api';
import { getCurrentUserId as getUserIdFromAuth } from './auth';

import type {
  Track,
  ArtistLink,
  AudioBook,
  PodcastEpisode,
  Playlist,
  PlaylistItem,
} from './types';

/* =========================
   БАЗОВЫЕ СПИСКИ / ДЕТАЛИ
   ========================= */
function filterVisibleTracks<
  T extends { id: string; audio?: string; audio_url?: string; stream_url?: string; time?: number; duration_seconds?: number }
>(
  arr: T[],
  opts: { allowShadow?: boolean; requireAudio?: boolean } = {}
): T[] {
  const { allowShadow = false, requireAudio = true } = opts;
  return arr.filter(t => {
    const audio = (t as any).audio ?? (t as any).audio_url ?? (t as any).stream_url ?? '';
    const time  = typeof (t as any).time === 'number'
      ? (t as any).time
      : typeof (t as any).duration_seconds === 'number'
        ? (t as any).duration_seconds
        : 0;

    const idOk    = allowShadow || !String(t.id).startsWith('__');
    const audioOk = !requireAudio || audio !== '';
    return idOk && audioOk && time >= 0;
  });
}



export const filterTracksForPlaylist = <T extends { id: string }>(arr: T[]) =>
  filterVisibleTracks(arr, { allowShadow: false, requireAudio: false });
// новые треки (бэк: GET /tracks)
export const fetchNewestTracks = async (): Promise<Track[]> => {
  const { data } = await api.get<Track[]>('tracks', {
    params: { _sort: 'created_at', _order: 'desc', has_audio: 1 },
  });
  return filterVisibleTracks(data, { requireAudio: true });
};

export const fetchTracks = async (): Promise<Track[]> => {
  const { data } = await api.get<Track[]>('tracks', {
    params: { _sort: 'created_at', _order: 'desc' },
  });
  return data;
};

// detail трека (бэк: /tracks/<id>/) — со слэшем на конце
export const fetchTrackById = async (id: string): Promise<Track | null> => {
  try {
    const { data } = await api.get<Track>(`tracks/${encodeURIComponent(id)}/`);
    return data;
  } catch {
    return null;
  }
};

// треки по "альбому"/плейлисту (bэк понимает albumid как id/title/slug)
export const fetchTracksByAlbum = async (albumId: string): Promise<Track[]> => {
  const { data } = await api.get<Track[]>('tracks', {
    params: { albumid: albumId, _sort: 'created_at', _order: 'asc' },
  });
  // ⬇️ убираем тени и безаудио
  return filterVisibleTracks(data, { allowShadow: false, requireAudio: true });
};

export const fetchTracksByAlbumId = fetchTracksByAlbum;

/* === Artists === */
export const fetchArtists = async (): Promise<ArtistLink[]> => {
  const { data } = await api.get<ArtistLink[]>('artistlinks');
  return data;
};

export const fetchArtistById = async (id: string): Promise<ArtistLink | undefined> => {
  const { data } = await api.get<ArtistLink[]>('artistlinks', { params: { id } });
  return data?.[0];
};

/* === AudioBooks === */
// список: /audiobooks (GET), detail: /audiobooks/<id>/
export const fetchAudioBooks = async (): Promise<AudioBook[]> => {
  const { data } = await api.get<AudioBook[]>('audiobooks', {
    params: { _sort: 'created_at', _order: 'desc' },
  });
  return data;
};

export async function fetchAudioBookById(id: string | number) {
  const { data } = await api.get<AudioBook>(`audiobooks/${encodeURIComponent(String(id))}/`);
  return data;
}

/* === Podcasts === */
// список: /podcastepisodes (GET), detail: /podcastepisodes/<id>/
export const fetchPodcasts = async (): Promise<PodcastEpisode[]> => {
  const { data } = await api.get<PodcastEpisode[]>('podcastepisodes', {
    params: { _sort: 'created_at', _order: 'desc' },
  });
  return data;
};

export async function fetchPodcastById(id: string | number) {
  const { data } = await api.get<PodcastEpisode>(`podcastepisodes/${encodeURIComponent(String(id))}/`);
  return data;
}

/* === Playlists === */
// нормализатор учитывает cover/cover_url, tracks, tracks_count
// services.ts
const normalizePlaylist = (p: any): Playlist => {
  const cover = String(p?.cover ?? p?.cover_url ?? '');
  const tracks = Array.isArray(p?.tracks) ? (p.tracks as Track[]) : undefined;
  const tracks_count =
    typeof p?.tracks_count === 'number' ? p.tracks_count : (Array.isArray(tracks) ? tracks.length : undefined);

  return {
    id: String(p?.id ?? ''),
    title: String(p?.title ?? ''),
    description: String(p?.description ?? ''),
    cover,
    owner_id: String(p?.owner_id ?? ''),
    created_at: String(p?.created_at ?? ''),
    artist_id: p?.artist_id ? String(p.artist_id) : undefined,

    // NEW:
    artist_display: String(p?.artist_display ?? ''),

    tracks,
    tracks_count,
  };
};


// ---------- ВАЖНО: резолвер сущности ----------
type ResolvedEntity =
  | { kind: 'track'; data: Track }
  | { kind: 'audiobook'; data: AudioBook }
  | { kind: 'podcast'; data: PodcastEpisode }
  | { kind: 'artist'; data: ArtistLink }
  | { kind: 'unknown'; data: null };

// services.ts
// services.ts
async function resolvePlaylistEntity(rawId: string): Promise<
  | { kind: 'track'; data: Track }
  | { kind: 'audiobook'; data: AudioBook }
  | { kind: 'podcast'; data: PodcastEpisode }
  | { kind: 'artist'; data: ArtistLink }
  | { kind: 'unknown'; data: null }
> {
  const { hint, id } = splitEntityId(rawId);

  try {
    if (hint === 'tr') {
      const { data } = await api.get<Track>(`tracks/${encodeURIComponent(id)}/`);
      return { kind: 'track', data };
    }
    if (hint === 'pc') {
      // ⬇️ ВАЖНО: больше не резолвим в shadow-track
      const { data } = await api.get<PodcastEpisode>(`podcastepisodes/${encodeURIComponent(id)}/`);
      return { kind: 'podcast', data };
    }
    if (hint === 'ab') {
      const { data } = await api.get<AudioBook>(`audiobooks/${encodeURIComponent(id)}/`);
      return { kind: 'audiobook', data };
    }
    if (hint === 'ar') {
      const { data } = await api.get<ArtistLink[]>('artistlinks', { params: { id } });
      return data?.[0] ? { kind: 'artist', data: data[0] } : { kind: 'unknown', data: null };
    }
  } catch { /* fallthrough */ }

  // дальше — как было:
  try {
    const { data } = await api.get<Track>(`tracks/${encodeURIComponent(id)}/`);
    return { kind: 'track', data };
  } catch {}

  if (/^\d+$/.test(id)) {
    try {
      const { data } = await api.get<AudioBook>(`audiobooks/${id}/`);
      return { kind: 'audiobook', data };
    } catch {}
    try {
      const { data } = await api.get<PodcastEpisode>(`podcastepisodes/${id}/`);
      return { kind: 'podcast', data };
    } catch {}
  }

  try {
    const { data } = await api.get<ArtistLink[]>('artistlinks', { params: { id } });
    if (Array.isArray(data) && data[0]) return { kind: 'artist', data: data[0] };
  } catch {}

  return { kind: 'unknown', data: null };
}


// Вернёт всё, что нужно для экрана альбома/плейлиста:
export async function fetchPlaylistForView(idOrTitle: string) {
  // 1) сам плейлист (если бэк пришлёт tracks при ?full=1 — используем их)
  const pl = await fetchPlaylistById(idOrTitle);

  // если бэк уже прислал треки – используем как есть (НЕ режем "__")
  if (Array.isArray(pl.tracks) && pl.tracks.length) {
    return { playlist: pl, tracks: pl.tracks };
  }

  // 2) иначе тащим playlistitems → резолвим сущности
  const items = await fetchPlaylistItems(pl.id || idOrTitle);

  // пытаемся получить реальные Track (для подкастов/книг это shadow Track c id "__pc_…/__ab_…")
  const trackIds = items.map((it) => it.track);
  const tracks: Track[] = [];
  for (const rid of trackIds) {
    const { hint, id } = splitEntityId(rid);

    try {
      if (hint === 'tr') {
        const { data } = await api.get<Track>(`tracks/${encodeURIComponent(id)}/`);
        tracks.push(data);
        continue;
      }
      if (hint === 'pc') {
        // у бэка есть «зеркальный» Track с id "__pc_<id>"
        const { data } = await api.get<Track>(`tracks/${encodeURIComponent(`__pc_${id}`)}/`);
        tracks.push(data);
        continue;
      }
      if (hint === 'ab') {
        const { data } = await api.get<Track>(`tracks/${encodeURIComponent(`__ab_${id}`)}/`);
        tracks.push(data);
        continue;
      }
      // артист в плейлисте — показывать отдельной карточкой автора, а не в трек-листе
    } catch {
      // пропускаем нераспознанные
    }
  }

  return { playlist: pl, tracks };
}


export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const { data } = await api.get('playlists/', {
    params: { _sort: 'created_at', _order: 'desc', with_counts: 1 }, // <- добавили
  });
  const arr =
    Array.isArray(data)
      ? data
      : Array.isArray((data as any).items)
      ? (data as any).items
      : Array.isArray((data as any).results)
      ? (data as any).results
      : [];
  return arr.map(normalizePlaylist);
};


export const fetchPlaylistById = async (idOrTitle: string): Promise<Playlist> => {
  const { data } = await api.get(`playlists/${encodeURIComponent(idOrTitle)}/`, {
    params: { full: 1 },   // это правильно — бэк пришлёт tracks
  });
  return normalizePlaylist(data);
};


// элементы: GET /playlistitems (без POST/DELETE путём /:id)
export const fetchPlaylistItems = async (playlistIdOrTitle: string): Promise<PlaylistItem[]> => {
  const { data } = await api.get<PlaylistItem[]>('playlistitems', {
    params: { playlist_id: playlistIdOrTitle },
  });
  return [...data].sort((a, b) => Number(a.position) - Number(b.position));
};

/* =========================
   ИЗБРАННОЕ (плейлисты «Любимые …»)
   ========================= */
export function getCurrentUserId(): string {
  return getUserIdFromAuth() ?? '';
}

type FavKind = 'track' | 'podcast' | 'audiobook' | 'artist';

const FAVORITES_TITLES = {
  track:     'Улюблені треки',
  podcast:   'Улюблені подкасти',   // <- было ошибочно "виконавці"
  audiobook: 'Улюблені аудіокниги',
  artist:    'Улюблені виконавці',
} as const;
// services.ts
function splitEntityId(raw: string) {
  const m = /^__([a-z]{2})_(.+)$/i.exec(String(raw));
  if (!m) return { hint: null as null|'tr'|'pc'|'ab'|'ar', id: String(raw) };
  const map: Record<string,'tr'|'pc'|'ab'|'ar'> = { tr:'tr', pc:'pc', ab:'ab', ar:'ar' };
  return { hint: map[m[1].toLowerCase()] ?? null, id: m[2] };
}

const favEnsureCache = new Map<string, Promise<Playlist>>();

async function ensureFavoritesPlaylist(userId: string, kind: FavKind): Promise<Playlist> {
  const cacheKey = `${userId}:${kind}`;
  const cached = favEnsureCache.get(cacheKey);
  if (cached) return cached;

  const p = (async () => {
    const title = FAVORITES_TITLES[kind];

    // 1) ищем существующий только по title
    const { data: found } = await api.get<Playlist[]>('playlists/', {
      params: { title, _sort: 'created_at', _order: 'desc' },
    });
    if (found.length) return normalizePlaylist(found[0]);

    // 2) создаём корректной ручкой: POST /playlists/
    const { data: created } = await api.post<Playlist>('playlists/', {
      title,
      description: `Автоплейлист: ${title}`,
    });

    return normalizePlaylist(created);
  })();

  favEnsureCache.set(cacheKey, p);
  try {
    return await p;
  } catch (e) {
    favEnsureCache.delete(cacheKey);
    throw e;
  }
}

export async function getFavoritesPlaylistByKind(userId: string, kind: FavKind) {
  return ensureFavoritesPlaylist(userId, kind);
}

export async function fetchFavoritesByKind(userId: string, kind: 'track'|'podcast'|'audiobook'|'artist') {
  const fav = await getFavoritesPlaylistByKind(userId, kind);

  const { data: items } = await api.get<Array<{ id: string; playlist_id: string; track: string; position: string }>>(
    'playlistitems',
    { params: { playlist_id: fav.id, _sort: 'position', _order: 'asc' } }
  );

  const entities = await Promise.all(
    items.map(async (it) => {
      const { id, hint } = splitEntityId(it.track);
      try {
        if (hint === 'tr' || (!hint && id && id !== '' && !id.startsWith('__') && kind === 'track')) {
          return (await api.get<Track>(`tracks/${encodeURIComponent(id)}/`)).data;
        }
        if (hint === 'pc') {
          return (await api.get<PodcastEpisode>(`podcastepisodes/${encodeURIComponent(id)}/`)).data;
        }
        if (hint === 'ab') {
          return (await api.get<AudioBook>(`audiobooks/${encodeURIComponent(id)}/`)).data;
        }
        if (hint === 'ar' || (!hint && isNaN(Number(id)) && kind === 'artist')) {
          const { data } = await api.get<ArtistLink[]>('artistlinks', { params: { id } });
          return data?.[0] ?? null;
        }
      } catch { /* ignore */ }
      return null;
    })
  );

  return { playlist: fav, items, entities: entities.filter(Boolean) as any[] };
}




export async function fetchPlaylistWithEntities(idOrTitle: string) {
  // сам плейлист с базовыми полями (+tracks если ?full=1)
  const playlist = await fetchPlaylistById(idOrTitle);

  // плоские элементы (id, playlist_id, track, position)
  const items = await fetchPlaylistItems(playlist.id || idOrTitle);

  // резолв каждого track в реальную сущность
  const resolved = await Promise.all(items.map(it => resolvePlaylistEntity(it.track)));

  return {
    playlist,
    items,
    entities: resolved, // [{kind:'track'|'audiobook'|'podcast'|'artist'|'unknown', data: ...}, ...]
  };
}

/* ===== helpers для пересборки по update_playlist (не обяз., но удобно) ===== */
async function fetchPlaylistTrackIds(plId: string): Promise<string[]> {
  const { data: items } = await api.get<PlaylistItem[]>('playlistitems', {
    params: { playlist_id: plId, _sort: 'position', _order: 'asc' },
  });
  return items.map((it) => it.track);
}

/** Добавить сущность в избранное (через /playlistitems POST) */
// services.ts

export async function addToFavorites(
  userId: string,
  kind: 'track' | 'podcast' | 'audiobook' | 'artist',
  entityId: string
) {
  const fav = await getFavoritesPlaylistByKind(userId, kind);

  // нормализуем, ЧТО кладём в поле track
  const trackField =
    kind === 'artist'   ? `__ar_${entityId}` :
    kind === 'podcast'  ? `__pc_${entityId}` :   // если у тебя подкасты в избранном
    kind === 'audiobook'? `__ab_${entityId}` :   // если у тебя аудиокниги в избранном
                          entityId;              // обычный трек

  // уже есть?
  const { data: exists } = await api.get<{ id: string }[]>('playlistitems', {
    params: { playlist_id: fav.id, track: trackField },
  });
  if (exists.length) return exists[0];

  // позиция = хвост + 1
  const { data: all } = await api.get<any[]>('playlistitems', {
    params: { playlist_id: fav.id },
  });
  const position = (all as any[]).length + 1;

  const { data: created } = await api.post('playlistitems', {
    playlist_id: fav.id,
    track: trackField,
    position: String(position),
  });
  return created;
}

export async function removeFromFavorites(
  userId: string,
  kind: 'track' | 'podcast' | 'audiobook' | 'artist',
  entityId: string
) {
  const fav = await getFavoritesPlaylistByKind(userId, kind);

  const lookups = [
    entityId,
    `__ar_${entityId}`,
    `__pc_${entityId}`,
    `__ab_${entityId}`,
  ];

  // ищем любой из возможных вариантов
  for (const track of lookups) {
    const { data: items } = await api.get<{ id: string }[]>('playlistitems', {
      params: { playlist_id: fav.id, track },
    });
    if (items[0]) {
      await api.delete('playlistitems', { params: { id: items[0].id } });
      return;
    }
  }
}

/* ===== удобные обёртки ===== */
export const fetchFavoritesTracksFromDb = (u: string) =>
  fetchFavoritesByKind(u, 'track').then((x) => ({
    playlist: x.playlist,
    items: x.items,
    tracks: x.entities as Track[],
  }));

export const fetchFavoritesAudioBooksFromDb = (u: string) =>
  fetchFavoritesByKind(u, 'audiobook').then((x) => ({
    playlist: x.playlist,
    items: x.items,
    audiobooks: x.entities as AudioBook[],
  }));

export const fetchFavoritesPodcastsFromDb = (u: string) =>
  fetchFavoritesByKind(u, 'podcast').then((x) => ({
    playlist: x.playlist,
    items: x.items,
    podcasts: x.entities as PodcastEpisode[],
  }));

export const fetchFavoritesArtistsFromDb = (u: string) =>
  fetchFavoritesByKind(u, 'artist').then((x) => ({
    playlist: x.playlist,
    items: x.items,
    artists: x.entities as ArtistLink[],
  }));

export const addTrackToFavorites = (u: string, id: string) =>
  addToFavorites(u, 'track', id);
export const removeTrackFromFavorites = (u: string, id: string) =>
  removeFromFavorites(u, 'track', id);

export const addAudioBookToFavorites = (u: string, id: string) =>
  addToFavorites(u, 'audiobook', id);
export const removeAudioBookFromFavorites = (u: string, id: string) =>
  removeFromFavorites(u, 'audiobook', id);

export const addPodcastToFavorites = (u: string, id: string) =>
  addToFavorites(u, 'podcast', id);
export const removePodcastFromFavorites = (u: string, id: string) =>
  removeFromFavorites(u, 'podcast', id);

export const addArtistToFavorites = (u: string, id: string) =>
  addToFavorites(u, 'artist', id);
export const removeArtistFromFavorites = (u: string, id: string) =>
  removeFromFavorites(u, 'artist', id);
