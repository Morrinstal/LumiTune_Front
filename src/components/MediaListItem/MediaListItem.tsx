import './MediaListItem.css'

type MediaListItemProps = {
  index:    number;
  cover:    string;
  title:    string;
  subtitle: string;
  duration: string;

  isActive?: boolean;
  onSelect?: () => void;
}

function MediaListItem({ index, cover, title, subtitle, duration, isActive = false, onSelect }: MediaListItemProps) {
    return ( 
    <button type='button' className='mediaListItem' onClick={onSelect}>
        <span className='mediaListItemIndex'>{index}</span>
        <img className='mediaListItemCover' src={cover} alt={`Cover of ${title}`} />
        
        <div className='mediaListItemContent'>
            <span className='mediaListItemTitle'>{title}</span>
            <span className='mediaListItemSubTitle'>{subtitle}</span>
        </div>
        
        <span className='mediaListItemDuration'>{duration}</span>
    </button>
    );
}

export default MediaListItem;