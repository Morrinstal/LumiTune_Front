import './MediaSideMenuV2.css';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';
import MediaDetails from '../MediaDetails/MediaDetails';
import ArtistOverviewCard from '../ArtistOverviewCard/ArtistOverviewCard';

export default function MediaSideMenuV2() {
  const { nowPlaying } = usePlayback();
  if (!nowPlaying) return <aside className="mediaSideMenuV2" />;

  if (nowPlaying.kind === 'track') {
    const { track, artist, playlist } = nowPlaying;

    const headerTitle =
      playlist?.title ?? (artist?.name ? `${artist.name} — Single` : 'Зараз відтворюється');

    return (
      <aside className="mediaSideMenuV2">
        <MediaDetails
          title={headerTitle}
          cover={track.cover}
          mediaTitle={track.name}
          artist={artist?.name ?? '—'}
        />
        {artist && (
          <ArtistOverviewCard
            key={artist.id}                 
            artistId={artist.id}
            bannerSrc={artist.photo}
            artist={artist.name}
            listeners={artist.listeners}
            description={artist.description}
          />
        )}
      </aside>
    );
  }

  if (nowPlaying.kind === 'audiobook') {
    const { ab, author } = nowPlaying;
    const by = author?.name ?? ab.author;

    const artistId = author?.id ?? ab.author_fk_id ?? null;

    return (
      <aside className="mediaSideMenuV2">
        <MediaDetails
          title="Аудіокнига"
          cover={ab.cover_image}
          mediaTitle={ab.title}
          artist={by}
        />

        {artistId && (
          <ArtistOverviewCard
            key={artistId}
            artistId={artistId}
            bannerSrc={author?.photo ?? ab.cover_image}
            artist={by}
            listeners={author?.listeners ?? '—'}
            description={author?.description ?? ab.info ?? ''}
          />
        )}
      </aside>
    );
  }

  const { pc, host } = nowPlaying;
  const by = host?.name ?? pc.host;

  const hostId = host?.id ?? pc.host_fk_id ?? null;

  return (
    <aside className="mediaSideMenuV2">
      <MediaDetails
        title="Подкаст"
        cover={pc.cover_image}
        mediaTitle={pc.title}
        artist={by}
      />

      {hostId && (
        <ArtistOverviewCard
          key={hostId}
          artistId={hostId}
          bannerSrc={host?.photo ?? pc.cover_image}
          artist={by}
          listeners={host?.listeners ?? '—'}
          description={host?.description ?? pc.info ?? ''}
        />
      )}
    </aside>
  );
}
