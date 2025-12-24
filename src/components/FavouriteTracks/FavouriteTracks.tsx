import './FavouriteTracks.css';
import { useMemo, useState, useEffect } from 'react';
import TrackListItem from '../TrackListItem/TrackListItem';
import FilterChip from '../FilterChip/FilterChip';

import { fetchArtists } from '../../api/services';
import type { ArtistLink } from '../../api/types';
import { formatDuration, formatDate } from '../../utils/format';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';

type ChoiceTab = 'tracks' | 'podcasts' | 'audiobooks';

function FavouriteTracks() {
  const [tab, setTab] = useState<ChoiceTab>('tracks');
  const [artists, setArtists] = useState<ArtistLink[]>([]);
  const { favorites, playTrack, playPodcast, playAudioBook, mode, currentId } = usePlayback();

  useEffect(() => {
    fetchArtists().then(setArtists);
  }, []);

  const artistById = useMemo(
    () => Object.fromEntries(artists.map(a => [a.id, a] as const)),
    [artists]
  );

  const titles: Record<ChoiceTab, string> = {
    tracks:     'Улюблені треки',
    podcasts:   'Улюблені подкасти',
    audiobooks: 'Улюблені аудіокниги',
  };

  const emptyState = (
    <div className="fav-empty">
      Немає збережених елементів у цій категорії!
    </div>
  );

  return (
    <div className='favouriteTracks'>
      <div
        className="chipGroup"
        style={{ position: 'absolute', left: 40, top: 38, zIndex: 1 }}
      >
        <FilterChip label='Треки'      selected={tab === 'tracks'}     onToggle={() => setTab('tracks')} />
        <FilterChip label='Подкасти'   selected={tab === 'podcasts'}   onToggle={() => setTab('podcasts')} />
        <FilterChip label='Аудиокниги' selected={tab === 'audiobooks'} onToggle={() => setTab('audiobooks')} />
      </div>

      <div className='favouriteTracksHeader'>
        <span className='favouriteTracksTitle'>{titles[tab]}</span>
      </div>
      
      <div className='favouriteTracksBody'>
        {tab === 'tracks' && (
          <div className='favouriteTracksBodyInner'>
            <div className='favTracksList'>
              {favorites.tracks.length === 0 && emptyState}
             {favorites.tracks.map((t, i) => (
                <TrackListItem
                  key={t.id}
                  id={t.id}
                  index={i + 1}
                  cover={t.cover}
                  title={t.name}
                  artist={artistById[t.artistid]?.name ?? '—'}
                  albumTitle={t.albumid?.trim() || '—'}   // <-- было '—'
                  addedAt={formatDate(t.created_at) || '—'}
                  duration={formatDuration(t.time)}
                  onPlay={() => playTrack(t.id)}
                  isPlaying={mode === 'track' && currentId === t.id}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'podcasts' && (
          <div className='favouriteTracksBodyInner'>
            <div className='favTracksList'>
              {favorites.podcasts.length === 0 && emptyState}
              {favorites.podcasts.map((p, i) => (
                <TrackListItem
                  key={p.id}
                  id={p.id}
                  index={i + 1}
                  cover={p.cover_image}
                  title={p.title}
                  artist={p.host}
                  albumTitle={'Подкаст'}
                  addedAt={formatDate(p.created_at) || '—'}
                  duration={formatDuration(p.duration_seconds)}
                  onPlay={() => playPodcast(p.id)}
                  isPlaying={mode === 'podcast' && currentId === p.id}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'audiobooks' && (
          <div className='favouriteTracksBodyInner'>
            <div className='favTracksList'>
              {favorites.audiobooks.length === 0 && emptyState}
              {favorites.audiobooks.map((ab, i) => (
                <TrackListItem
                  key={ab.id}
                  id={ab.id}
                  index={i + 1}
                  cover={ab.cover_image}
                  title={ab.title}
                  artist={ab.author}
                  albumTitle={'Аудіокнига'}
                  addedAt={formatDate(ab.created_at) || '—'}
                  duration={formatDuration(ab.duration_seconds)}
                  onPlay={() => playAudioBook(ab.id)}
                  isPlaying={mode === 'audiobook' && currentId === ab.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavouriteTracks;
