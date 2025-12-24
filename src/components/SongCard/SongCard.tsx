import './SongCard.css'

type SongCardProps = {
  id:        string;
  coverSrc:  string;
  title:     string;
  artists:   string | string[];
  onPlay: (id: string) => void;
}

function SongCard({ id, coverSrc, title, artists, onPlay }: SongCardProps) {
    const artistsText = Array.isArray(artists) ? artists.join(', ') : artists;

    return (
    <div className="songCard">
        <button 
          type='button' 
          className='songCard__btn'
          onClick={() => onPlay(id)}
        >
            <img className='songCard__cover' src={coverSrc} alt={title} />
            <div className='songCard__title'>{title}</div>
            <div className='songCard__subtitle'>{artistsText}</div>
        </button>
    </div>
    );
}

export default SongCard;