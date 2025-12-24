import './AlbumCard.css'

type AlbumCardProps = {
  id:        string;
  coverSrc:  string;
  title:     string;
  artists:   string | string[];
  onClick: (id: string) => void;
}

function SongCard({ id, coverSrc, title, artists, onClick }: AlbumCardProps) {
    const artistsText = Array.isArray(artists) ? artists.join(', ') : artists;

    return (
    <div className="albumCard">
        <button 
          type='button' 
          className='albumCard__btn'
          onClick={() => onClick(id)}
        >
          <img className='albumCard__cover' src={coverSrc} alt={title} />
          <div className='albumCard__title'>{title}</div>
          <div className='albumCard__subtitle'>by {artistsText} • Album</div>
        </button>
    </div>
    );
}

export default SongCard;