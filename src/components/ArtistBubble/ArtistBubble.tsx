import './ArtistBubble.css';

type ArtistBubbleProps = {
  avatar:    string;
  artist:    string;
  listeners: string;
  href:      string;
}

function ArtistBubble({ avatar, artist, listeners, href }: ArtistBubbleProps) {
  return (
    <a className="artistBubble" href={href} aria-label={artist}>
      <div className="avatarBubble">
        <img className="imgBubble" src={avatar} alt={artist} />
      </div>

      <div className="infoBubble">
        <p className="artistNameBubble">{artist}</p>
        <p className="listenersBubble">{listeners}</p>
      </div>
    </a>
  );
}

export default ArtistBubble;
