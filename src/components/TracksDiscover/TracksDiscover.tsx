import './TracksDiscover.css';
import { useEffect, useMemo, useState } from 'react';
import SongCard from '../SongCard/SongCard';
import AlbumCard from '../AlbumCard/AlbumCard';
import ArtistBubble from '../ArtistBubble/ArtistBubble';

import leftArrowDark from '../../assets/leftArrowDark.svg';
import leftArrowLight from '../../assets/leftArrowLight.svg';
import rightArrowDark from '../../assets/rightArrowDark.svg';
import rightArrowLight from '../../assets/rightArrowLight.svg';

import {
  fetchNewestTracks,
  fetchArtists,
  fetchPlaylists,
  fetchTracks,
  getCurrentUserId,
} from '../../api/services';
import type { Track, ArtistLink, Playlist } from '../../api/types';
import { useSearch, norm } from '../SearchProvider/SearchProvider';

type TracksDiscoverProps = {
  onAlbumOpen: (albumId: string) => void;
  onPlayTrack: (id: string) => void;
};

const PAGE_SIZE = 5;      // треки/альбомы
const ARTISTS_PAGE = 4;   // исполнители

function TracksDiscover({ onAlbumOpen, onPlayTrack }: TracksDiscoverProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<ArtistLink[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  // индексы окон-каруселей
  const [trackIdx, setTrackIdx] = useState(0);
  const [albumIdx, setAlbumIdx] = useState(0);
  const [artistIdx, setArtistIdx] = useState(0);

  const { query } = useSearch();
  const userId = getCurrentUserId();

  useEffect(() => {
    (async () => {
      const [t, a, pls, trAll] = await Promise.all([
        fetchNewestTracks(),
        fetchArtists(),
        fetchPlaylists(),
        fetchTracks(),
      ]);
      setTracks(t);
      setArtists(a);

      // плейлисты, похожие на альбомы (исключаем пользовательские/«любимые»)
      const onlyAlbumLike = pls
        .filter(pl => pl.owner_id !== userId && !/^любимые/i.test(pl.title));

      setPlaylists(onlyAlbumLike);
      setAllTracks(trAll);
      // сброс стартовых окон
      setTrackIdx(0);
      setAlbumIdx(0);
      setArtistIdx(0);
    })();
  }, [userId]);

  const artistById = useMemo(
    () => Object.fromEntries(artists.map(a => [a.id, a] as const)),
    [artists]
  );

  // собираем карту "альбом -> имена артистов из его треков"
  const albumArtists = useMemo(() => {
    const tmp = new Map<string, Set<string>>();
    for (const t of allTracks) {
      const albumKey = t.albumid;
      if (!albumKey) continue;
      const artistName =
        (artistById as any)?.[t.artistid]?.name ??
        (t as any)?.artist?.name ??
        '';
      if (!artistName) continue;
      if (!tmp.has(albumKey)) tmp.set(albumKey, new Set());
      tmp.get(albumKey)!.add(artistName);
    }
    const flat = new Map<string, string>();
    for (const [k, set] of tmp.entries()) {
      flat.set(k, [...set].join(' / '));
    }
    return flat;
  }, [allTracks, artistById]);

  // ---------- Поиск ----------
  const q = query;
  const includes = (s: string) => norm(s).includes(norm(q));

  const tracksFiltered = useMemo(() => {
    if (!q) return tracks;
    return tracks.filter(t =>
      includes(t.name) ||
      includes(artistById[t.artistid]?.name ?? (t as any).artist?.name ?? '')
    );
  }, [q, tracks, artistById]);

  const playlistsFiltered = useMemo(() => {
    if (!q) return playlists;
    return playlists.filter(pl => {
      const fromId    = albumArtists.get(pl.id)    || '';
      const fromTitle = albumArtists.get(pl.title) || '';
      const disp      = pl.artist_display || '';
      return (
        includes(pl.title) ||
        includes(disp) ||
        includes(fromId) ||
        includes(fromTitle)
      );
    });
  }, [q, playlists, albumArtists]);

  const artistsFiltered = useMemo(() => {
    if (!q) return artists;
    return artists.filter(a => includes(a.name));
  }, [q, artists]);

  // сброс индексов, если наборы изменились
  useEffect(() => {
    if (trackIdx > Math.max(0, tracksFiltered.length - 1)) setTrackIdx(0);
  }, [tracksFiltered.length, trackIdx]);

  useEffect(() => {
    if (albumIdx > Math.max(0, playlistsFiltered.length - 1)) setAlbumIdx(0);
  }, [playlistsFiltered.length, albumIdx]);

  useEffect(() => {
    if (artistIdx > Math.max(0, artistsFiltered.length - 1)) setArtistIdx(0);
  }, [artistsFiltered.length, artistIdx]);

  // окна по N
  const tracksPage = tracksFiltered.slice(trackIdx, trackIdx + PAGE_SIZE);
  const albumsPage = playlistsFiltered.slice(albumIdx, albumIdx + PAGE_SIZE);
  const artistsPage = artistsFiltered.slice(artistIdx, artistIdx + ARTISTS_PAGE);

  // доступность
  const canPrevTracks = trackIdx > 0;
  const canNextTracks = trackIdx + PAGE_SIZE < tracksFiltered.length;

  const canPrevAlbums = albumIdx > 0;
  const canNextAlbums = albumIdx + PAGE_SIZE < playlistsFiltered.length;

  const canPrevArtists = artistIdx > 0;
  const canNextArtists = artistIdx + ARTISTS_PAGE < artistsFiltered.length;

  // хендлеры (двигаем по одному)
  const goPrevTracks = () => canPrevTracks && setTrackIdx(trackIdx - 1);
  const goNextTracks = () => canNextTracks && setTrackIdx(trackIdx + 1);

  const goPrevAlbums = () => canPrevAlbums && setAlbumIdx(albumIdx - 1);
  const goNextAlbums = () => canNextAlbums && setAlbumIdx(albumIdx + 1);

  const goPrevArtists = () => canPrevArtists && setArtistIdx(artistIdx - 1);
  const goNextArtists = () => canNextArtists && setArtistIdx(artistIdx + 1);

  return (
    <div className='tracksDiscover'>
      <div className='tracksContentBlock'>
        {/* Треки */}
        <section className='topMusicToday'>
          <div className="topMusic__title_block">
            <span className='topMusic__title'>ТОП музика сьогодні!</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextTracks}
                aria-label="Наступні треки"
                disabled={!canNextTracks}
              >
                <img
                  className='rightArrow'
                  src={canNextTracks ? leftArrowLight : leftArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevTracks}
                aria-label="Попередні треки"
                disabled={!canPrevTracks}
              >
                <img
                  className='leftArrow'
                  src={canPrevTracks ? rightArrowLight : rightArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className='songCardsGrid'>
            {tracksPage.map(t => (
              <SongCard
                key={t.id}
                id={t.id}
                coverSrc={t.cover}
                title={t.name}
                artists={artistById[t.artistid]?.name ?? '—'}
                onPlay={onPlayTrack}
              />
            ))}
          </div>
        </section>

        {/* Альбомы */}
        <section className='newMusicReleases'>
          <div className='newMusic__title_block'>
            <span className="newMusic__title">Нові музичні релізи</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextAlbums}
                aria-label="Наступні альбоми"
                disabled={!canNextAlbums}
              >
                <img
                  className='rightArrow'
                  src={canNextAlbums ? leftArrowLight : leftArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevAlbums}
                aria-label="Попередні альбоми"
                disabled={!canPrevAlbums}
              >
                <img
                  className='leftArrow'
                  src={canPrevAlbums ? rightArrowLight : rightArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className='songCardsGrid2'>
            {albumsPage.map(pl => (
              <AlbumCard
                key={pl.id}
                id={pl.id}
                coverSrc={pl.cover}
                title={pl.title}
                artists={pl.artist_display ?? pl.owner_id ?? '—'}
                onClick={onAlbumOpen}
              />
            ))}
          </div>
        </section>

        {/* Исполнители */}
        <section className='favArtists'>
          <div className="favArtists__title_block">
            <span className='favArtists__title'>Популярні виконавці</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextArtists}
                aria-label="Наступні виконавці"
                disabled={!canNextArtists}
              >
                <img
                  className='rightArrow'
                  src={canNextArtists ? leftArrowLight : leftArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevArtists}
                aria-label="Попередні виконавці"
                disabled={!canPrevArtists}
              >
                <img
                  className='leftArrow'
                  src={canPrevArtists ? rightArrowLight : rightArrowDark}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div className='bubbleCardsGrid'>
            {artistsPage.map(a => (
              <ArtistBubble
                key={a.id}
                avatar={a.photo}
                artist={a.name}
                listeners={a.listeners}
                href="#"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TracksDiscover;
