import './ArtistListItem.css'

type ArtistListItemProps = {
  avatar:   string;
  title:    string;
  subtitle: string;
  href:     string;
}

function ArtistListItem({ avatar, title, subtitle, href }: ArtistListItemProps) {
    return (
    <div className='artistListItem'>
        <a className='artistListItemLink' href={href}>
            <img className='artistAvatar' src={avatar} alt='Artist Avatar' />

            <div className='artistInfo'>
                <p className='artistTitle'>{title}</p>
                <p className='artistSubtitle'>{subtitle}</p>
            </div>
        </a>
    </div>
    );
}

export default ArtistListItem;