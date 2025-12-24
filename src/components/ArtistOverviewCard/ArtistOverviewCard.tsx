import './ArtistOverviewCard.css';
import { useState, useEffect } from 'react';
import {
  getCurrentUserId,
  fetchFavoritesArtistsFromDb,
  addArtistToFavorites,
  removeArtistFromFavorites,
} from '../../api/services';

type ArtistOverviewCardProps = {
  bannerSrc:   string;
  artist:      string;
  listeners:   string;
  description: string;
  artistId:    string;
};

function ArtistOverviewCard({
  bannerSrc,
  artist,
  listeners,
  description,
  artistId,
}: ArtistOverviewCardProps) {
  const userId = getCurrentUserId();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Проверяем, подписан ли пользователь на текущего артиста
  useEffect(() => {
    (async () => {
      try {
        const { artists } = await fetchFavoritesArtistsFromDb(userId);
        setIsFollowing(artists.some((a) => a.id === artistId));
      } catch (err) {
        console.error('Ошибка загрузки любимых исполнителей', err);
        setIsFollowing(false);
      }
    })();
  }, [artistId, userId]);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await removeArtistFromFavorites(userId, artistId);
        setIsFollowing(false);
        // уведомляем остальные части UI (LeftSidebar)
        document.dispatchEvent(new CustomEvent('fav-artists:changed'));
      } else {
        await addArtistToFavorites(userId, artistId);
        setIsFollowing(true);
        // уведомляем остальные части UI (LeftSidebar)
        document.dispatchEvent(new CustomEvent('fav-artists:changed'));
      }
    } catch (err) {
      console.error('Ошибка при изменении подписки', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="artistOverviewCard">
      <img className="artistBanner" alt="Artist Banner" src={bannerSrc} />

      <div className="artistOverviewNameBlock">
        <span className="artistOverviewName">{artist}</span>
      </div>

      <div className="listenersAndFollow">
        <span className="listenersOverview">
          {listeners} слухачів на місяць
        </span>
        <button
          type="button"
          className="artistOverviewCard__followBtn"
          onClick={handleFollow}
          disabled={loading}
        >
          {loading ? '...' : isFollowing ? 'Відписатися' : 'Підписатися'}
        </button>
      </div>

      <div className="artistOverviewDescBlock">
        <span className="artistOverviewDesc">{description}</span>
      </div>
    </section>
  );
}

export default ArtistOverviewCard;
