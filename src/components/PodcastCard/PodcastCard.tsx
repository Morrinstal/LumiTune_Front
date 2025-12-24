import './PodcastCard.css'

type PodcastCardProps = {
  title:       string;
  subtitle:    string;
  cover:       string;
  date:        string;
  duration:    string;
  description: string;
  href:        string;
  onPlay?: () => void;
};

function PodcastCard({
  title, subtitle, cover, date, duration, description, href, onPlay
}: PodcastCardProps) {

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onPlay?.();
  };

  return (
    <article className="podcastCard">
      <a className="cardLink" href={href} aria-label={`Open: ${title}`} onClick={handleClick}>
        <header className="headerCard">
          <span className="titlePodcast">{title}</span>
          <span className="subtitlePodcast">
            <span className="episodeText">Епізод •</span> {subtitle}
          </span>
        </header>

        <img className="coverPodcast" src={cover} alt={title} loading="lazy" decoding="async" />

        <p className="descriptionPodcast">
          <span className="date">{date}</span>
          <span className="duration">{' • '}{duration}{' • '}</span>
          <span className="descText">{description}</span>
        </p>
      </a>
    </article>
  );
}

export default PodcastCard;
