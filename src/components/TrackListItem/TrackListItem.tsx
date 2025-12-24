import './TrackListItem.css'

type TrackListItemProps ={
  id:         string;
  index:      number;
  title:      string;
  artist:     string;
  cover:      string;
  albumTitle: string;
  addedAt:    string;
  duration:   string;
  onPlay?: (id: string) => void;
  isPlaying?: boolean;
}

function TrackListItem({
  id, index, title, artist, cover, albumTitle, addedAt, duration, onPlay, isPlaying
}: TrackListItemProps) {

  const handleClick = () => onPlay?.(id);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay?.(id);
    }
  };

  // Показываем строку исполнителя, только если она значимая и это не "__ar_*"
  const showArtist =
    !!artist &&
    artist !== '—' &&
    !/^__ar_/i.test(String(id));

  return (
    <div
      className={`trackListItem ${onPlay ? 'trackListItem--clickable' : ''} ${isPlaying ? 'is-playing' : ''}`}
      role={onPlay ? 'button' : undefined}
      tabIndex={onPlay ? 0 : -1}
      aria-pressed={isPlaying ? true : undefined}
      onClick={onPlay ? handleClick : undefined}
      onKeyDown={onPlay ? handleKeyDown : undefined}
    >
      <span className='trackIndex'>{index}</span>

      <div className='trackBody'>
        <img className='trackCover' src={cover} alt='' aria-hidden="true" />

        <div className="trackInfoBlock">
          <div className="trackInfo">
            <span className="trackTitle">{title}</span>
            {showArtist && <span className="trackArtist">{artist}</span>}
          </div>

          <span className="trackAlbum">{albumTitle}</span>
          <span className="trackDate">{addedAt}</span>
          <span className="trackTime">{duration}</span>
        </div>
      </div>
    </div>
  );
}

export default TrackListItem;
