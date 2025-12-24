// MediaDetails.tsx
import './MediaDetails.css';
import shareIcon from '../../assets/MediaDetails/shareIcon.svg';

import heartFilled from '../../assets/heartSolar.svg';  
import heartOutline from '../../assets/heartUmbra.svg'

import { usePlayback } from '../PlaybackProvider/PlaybackProvider';

type MediaDetailsProps = {
  title:      string;
  cover:      string;
  mediaTitle: string;
  artist:     string;

  onMore?: () => void;
  onClose?: () => void;
  onShare?: () => void;
}

function MediaDetails({
  title, cover, mediaTitle, artist,
  onMore, onClose, onShare,
}: MediaDetailsProps) {
  const { isCurrentFavorite, toggleFavoriteCurrent, nowPlaying } = usePlayback();

  const favAriaLabel = isCurrentFavorite
    ? 'Видалити з улюблених'
    : 'Додати в улюблені';

  return (
    <div className='mediaDetails'>
      <div className='mediaDetailsHeader'>
        <span className='mediaDetailsTitle'>{title}</span>
      </div>

      <img className='mediaCover' src={cover} alt='Media Cover' />

      <div className='mediaInfoBar'>
        <div className='innerMediaTextBar'>
          <div className='mediaName'  title={mediaTitle}>{mediaTitle}</div>
          <div className='artistName' title={artist}>{artist}</div>
        </div>

        <div className='mediaDetailsActions2'>
          <button className='iconBtn' type='button' aria-label='Share' onClick={onShare}>
            <img className='iconGlyph' src={shareIcon} alt='Share Icon' />
          </button>

          <button
            type='button'
            className={`iconBtn favBtn ${isCurrentFavorite ? 'is-active' : ''}`}
            aria-label={favAriaLabel}
            aria-pressed={isCurrentFavorite}
            onClick={toggleFavoriteCurrent}
            disabled={!nowPlaying}
            title={favAriaLabel}
          >
            <img
              className='iconGlyph'
              src={isCurrentFavorite ? heartFilled : heartOutline}
              alt=''
              aria-hidden='true'
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaDetails;