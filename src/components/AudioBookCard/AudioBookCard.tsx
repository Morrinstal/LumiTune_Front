import './AudioBookCard.css'
import divider from '../../assets/AudioBookCard/divider.svg'

type AudioBookCardProps = {
  cover:       string;
  title:       string;
  author:      string;
  genre:       string | string[];
  description: string;
  date:        string;
  duration:    string;
  href:        string;
  onPlay?:     () => void;
};

function AudioBookCard(props: AudioBookCardProps) {
  const { cover, title, author, genre, description, date, duration, href, onPlay } = props;
  const genreText = Array.isArray(genre) ? genre.join(', ') : genre;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    onPlay?.();
  };

  return (
    <article className='audioBookCard'>
      <a className='abLink' href={href} aria-label={`Audiobook: ${title}`} onClick={handleClick}>
        <img className='abCover' src={cover} alt={title} loading='lazy' decoding='async' />

        <div className='abBody'>
          <div className='abHeader'>
            <span className='abTitle' title={title}>{title}</span>
            <img className='abDivider' src={divider} alt='' aria-hidden='true'/>
            <span className='abAuthor' title={author}>{author}</span>
          </div>

          <p className='abGenre'>{genreText}</p>
          <p className='abDesc'><span className='abDescText'>{description}</span></p>

          <div className='abFooter'>
            <div className="abDate">{date}</div>
            <div className="abDuration">{duration}</div>
          </div>
        </div>
      </a>
    </article>
  );
}
export default AudioBookCard;
