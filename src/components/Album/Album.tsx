import './Album.css';
import { useEffect, useMemo, useState } from 'react';
import TrackListItem from '../TrackListItem/TrackListItem';
import { fetchTracksByAlbum, fetchArtistById, fetchPlaylistById } from '../../api/services';
import type { Track, Playlist, ArtistLink } from '../../api/types';
import { formatDuration } from '../../utils/format';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';

type AlbumProps = { albumId: string };

function Album({ albumId }: AlbumProps) {
  const [album, setAlbum]   = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [headerArtist, setHeaderArtist] = useState<ArtistLink | null>(null);

  // 👇 словарь artistId -> displayName
  const [artistDict, setArtistDict] = useState<Record<string, string>>({});

  const player = usePlayback();
  const { playTrack, mode, currentId } = player as any;

  useEffect(() => {
    (async () => {
      try { setAlbum(await fetchPlaylistById(albumId)); } catch { setAlbum(null); }

      const t = await fetchTracksByAlbum(albumId);
      setTracks(t);

      // артист «в шапке» (по первому треку как и было)
      if (t[0]?.artistid) {
        try { setHeaderArtist((await fetchArtistById(t[0].artistid)) ?? null); }
        catch { setHeaderArtist(null); }
      } else setHeaderArtist(null);

      // 🟦 загрузим имена авторов для всех уникальных artistid
      const ids = Array.from(new Set(t.map(x => (x as any).artistid).filter(Boolean)));
      const entries: Array<[string, string]> = [];
      for (const id of ids) {
        try {
          const a = await fetchArtistById(id);
          if (a?.name) entries.push([id, a.name]);
        } catch {}
      }
      // если у трека в поле artist уже лежит строковое имя — тоже кладём
      for (const tr of t) {
        const aid = (tr as any).artistid;
        const anm = (tr as any).artist || (tr as any).artist_display;
        if (aid && anm && !entries.find(([k]) => k === aid)) entries.push([aid, anm]);
      }
      setArtistDict(Object.fromEntries(entries));
    })();
  }, [albumId]);

  const albumCover = useMemo(() => album?.cover || tracks[0]?.cover || '', [album, tracks]);
  const albumTitle = album?.title || (tracks[0]?.name ? `${tracks[0].name} — Single` : '—');
  const headerArtistName = headerArtist?.name || '—';
  const headerArtistImg  = headerArtist?.photo || albumCover;

  return (
    <div className='album'>
      <div className='albumInnerBlock'>
        <div className='albumHeader'>
          {albumCover && <img className='albumCover' src={albumCover} alt='Album Cover' />}
          <div className='albumTitleBlock'>
            <span className='albumUpperTitle'>Альбом</span>
            <span className='albumTitle'>{albumTitle}</span>
          </div>
        </div>

        <div className='albumBody'>
          <div className='albumBodyContent'>
            <section className='albumBtnArtistSection'>
              <div className='albumArtistBlock'>
                {headerArtistImg && <img className='albumArtistCover' src={headerArtistImg} alt='Artist Cover' />}
                <div className='albumArtistInfo'>
                  <span className='albumArtistTitle'>Виконавець</span>
                  <span className='albumArtistSubtitle'>{headerArtistName}</span>
                </div>
              </div>
            </section>

            <section className='albumTrackListSection'>
              {tracks.map((t, i) => {
                const aid = (t as any).artistid || '';
                // ✅ имя «на строку»: из словаря → из самого трека → запасной вариант — имя из шапки
               const rowArtistName =
                  artistDict[aid] ??
                  (t as any).artist_display ??
                  (t as any).artist ??
                  (aid || headerArtistName);
                return (
                  <TrackListItem
                    key={t.id}
                    id={t.id}
                    index={i + 1}
                    cover={t.cover}
                    title={t.name}
                    artist={rowArtistName}
                    albumTitle={albumTitle}
                    addedAt={new Date(t.created_at).toLocaleDateString('uk-UA')}
                    duration={formatDuration(t.time)}
                    onPlay={() => playTrack(t.id)}
                    isPlaying={mode === 'track' && currentId === t.id}
                  />
                );
              })}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Album;
