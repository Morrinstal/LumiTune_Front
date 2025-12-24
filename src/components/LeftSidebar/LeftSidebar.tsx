import './LeftSidebar.css';
import NavItem from '../NavItem/NavItem';
import HomeIcon from '../../assets/NavItem/homeIcon.svg';
import MediatekaIcon from '../../assets/NavItem/mediatekaIcon.svg';
import HeartIcon from '../../assets/NavItem/heartIcon.svg';
import PlaylistIcon from '../../assets/NavItem/playlistIcon.svg';
import ListStreamline from '../../assets/LeftSidebar/ListStreamline.svg';
import ArtistListItem from '../ArtistListItem/ArtistListItem';
import refreshIcon from '../../assets/LeftSidebar/refreshIcon.svg';
import clockIcon from '../../assets/LeftSidebar/clockIcon.svg';

import { useEffect, useState } from 'react';
import type { ArtistLink } from '../../api/types';
import { fetchFavoritesArtistsFromDb, getCurrentUserId } from '../../api/services';

type Props = {
  active?: 'home' | 'liked' | 'album' | 'create' | 'library';
  onHomeClick: () => void;
  onLikedClick: () => void;
  onCreateClick: () => void;
  onLibraryClick: () => void;
};

function LeftSidebar({
  active = 'home',
  onHomeClick,
  onLikedClick,
  onCreateClick,
  onLibraryClick,
}: Props) {
  const [favArtists, setFavArtists] = useState<ArtistLink[]>([]);
  const userId = getCurrentUserId();

  useEffect(() => {
    async function loadFavArtists() {
      try {
        const { artists } = await fetchFavoritesArtistsFromDb(userId);
        setFavArtists(artists);
      } catch (e) {
        console.error('fav artists load', e);
        setFavArtists([]);
      }
    }

    // первичная загрузка
    loadFavArtists();

    // подписка на глобальное событие от любых компонентов
    const handler = () => loadFavArtists();
    document.addEventListener('fav-artists:changed', handler);

    return () => {
      document.removeEventListener('fav-artists:changed', handler);
    };
  }, [userId]);

  return (
    <aside className="leftSidebar">
      <div className="menuTitle">
        <span className="menuTitleText">Меню</span>
      </div>

      <div className="menuBlock">
        <NavItem
          iconSrc={HomeIcon}
          title="Головна"
          active={active === 'home'}
          onClick={onHomeClick}
        />
        <NavItem
          iconSrc={MediatekaIcon}
          title="Моя медіатека"
          onClick={onLibraryClick}
        />
      </div>

      <div className="dividerBlock">
        <div className="dividerLine" />
      </div>

      <div className="playlistsTitle">
        <span className="playlistsTitleText">Плейлисти</span>
      </div>

      <div className="playlistsBlock">
        <NavItem
          iconSrc={HeartIcon}
          title="Улюблене медіа"
          active={active === 'liked'}
          onClick={onLikedClick}
        />
        <NavItem
          iconSrc={PlaylistIcon}
          title="Створити плейліст"
          active={active === 'create'}
          onClick={onCreateClick}
        />
      </div>

      <div className="artistsList">
        <div className="yPHeader">
          <div className="yPHeaderRow">
            <span className="ypTxt">Ваші виконавці</span>
            <img className="listStreamlineIcon" src={ListStreamline} />
          </div>
        </div>

        {favArtists.slice(0, 5).map((a) => (
          <ArtistListItem
            key={a.id}
            avatar={a.photo}
            title={a.name}
            subtitle="Виконавець"
            href="#"
          />
        ))}
      </div>

      <div className="dividerBlockLower">
        <div className="dividerLine" />
      </div>

      <div className="recentlyPlayed">
        <div className="rPHeader">
          <div className="rPHeaderRow">
            <span className="rPTitle">Нещодавно прослухані</span>
            <img className="rPRefresh" src={refreshIcon} alt="..." />
          </div>
        </div>

        <div className="rPBody">
          <img className="clockIcon" src={clockIcon} alt="..." />
        </div>
      </div>
    </aside>
  );
}

export default LeftSidebar;
