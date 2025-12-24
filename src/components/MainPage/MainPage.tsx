import { useState } from 'react';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import LeftSidebar from '../LeftSidebar/LeftSidebar';
import MainDiscover from '../MainDiscover/MainDiscover';
import MediaSideMenuV2 from '../MediaSideMenuV2/MediaSideMenuV2';
import MediaDiscover from '../MediaDiscover/MediaDiscover';
import TracksDiscover from '../TracksDiscover/TracksDiscover';
import FilterChip from '../FilterChip/FilterChip';
import FavouriteTracks from '../FavouriteTracks/FavouriteTracks';
import Album from '../Album/Album';
import PlayerContainer from '../PlayerContainer/PlayerContainer';
import CreatePlaylist from '../CreatePlaylist/CreatePlaylist';
import MyMediatheque from '../MyMediatheque/MyMediatheque';
import { PlaybackProvider, usePlayback } from '../PlaybackProvider/PlaybackProvider';
import { SearchProvider } from '../SearchProvider/SearchProvider';

type CenterTab = 'all' | 'tracks' | 'other';
type View = 'home' | 'liked' | 'album' | 'create' | 'library';

export default function MainPage() {
  return (
    <SearchProvider>
      <PlaybackProvider>
        <MainPageBody />
      </PlaybackProvider>
    </SearchProvider>
  );
}

function MainPageBody() {
  const [tab, setTab] = useState<CenterTab>('all');
  const [view, setView] = useState<View>('home');
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const { playTrack } = usePlayback();

  const openAlbum = (albumId: string) => {
    setCurrentAlbumId(albumId);
    setView('album');
  };
  const handlePlayTrack = (id: string) => { void playTrack(id); };

  const center = (() => {
    switch (view) {
      case 'home':
        return (
          <>
            <div className="chipGroup" style={{ position:'absolute', left:362, top:96, zIndex:1 }}>
              <FilterChip label="Bci"   selected={tab === 'all'}   onToggle={() => setTab('all')} />
              <FilterChip label="Треки" selected={tab === 'tracks'} onToggle={() => setTab('tracks')} />
              <FilterChip label="Інше"  selected={tab === 'other'}  onToggle={() => setTab('other')} />
            </div>

            {tab === 'all'    && <MainDiscover   onAlbumOpen={openAlbum} onPlayTrack={handlePlayTrack} />}
            {tab === 'tracks' && <TracksDiscover onAlbumOpen={openAlbum} onPlayTrack={handlePlayTrack} />}
            {tab === 'other'  && <MediaDiscover />}
          </>
        );
      case 'liked':
        return <FavouriteTracks />;
      case 'album':
        return currentAlbumId ? <Album albumId={currentAlbumId} /> : null;
      case 'create':
        return <CreatePlaylist />;
      case 'library':
        return <MyMediatheque />;
    }
  })();

  const showRight = !(view === 'create' || view === 'liked' || view === 'album' || view === 'library');

  return (
    <div className="page--main">
      <Header />

      <LeftSidebar
        active={view}
        onHomeClick={() => setView('home')}
        onLikedClick={() => setView('liked')}
        onCreateClick={() => setView('create')}
        onLibraryClick={() => setView('library')}
      />

      {center}

      {showRight && <MediaSideMenuV2 />}

      <PlayerContainer />
      <Footer />
    </div>
  );
}

