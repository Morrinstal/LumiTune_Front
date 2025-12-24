// Header.tsx
import './Header.css';
import { useEffect, useState } from 'react';
import logo from '../../assets/HeaderPodcasts/logo.svg';
import searchIcon from '../../assets/HeaderPodcasts/searchIcon.svg';
import micIcon from '../../assets/HeaderPodcasts/Microphone.svg';
import bellIcon from '../../assets/HeaderPodcasts/bell.svg';
import avatar from '../../assets/HeaderPodcasts/Avatar.svg';
import { useSearch } from '../SearchProvider/SearchProvider';

function Header() {
  const { query, setQuery } = useSearch();
  const [text, setText] = useState(query);

  useEffect(() => {
    setText(query);
  }, [query]);

  useEffect(() => {
    const h = setTimeout(() => setQuery(text), 150);
    return () => clearTimeout(h);
  }, [text, setQuery]);

  return (
    <>
      <header className='headerPodcasts'>

        <a href="/" className="headerLogo" aria-label="LumiTune — на головну">
          <img className="logoImg" src={logo} alt="" aria-hidden="true" />
        </a>

        <form className="searchBlock" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className='searchBar'>
            <img className='searchIcon' src={searchIcon} alt='Search Symbol' />
            <input
              type='search'
              className='searchInput'
              placeholder='Виконавці, треки, подкасти...'
              enterKeyHint='search'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="micBlock" type="button" aria-label="Голосовий пошук">
              <img className="micIcon" src={micIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className='bellAndAvatarBlock'>
          <div className='innerBellAndAvatarBlock'>
            <button className="bellIconBlock" type="button" aria-label="Сповіщення">
              <img className="bellIcon" src={bellIcon} alt="" aria-hidden="true" />
            </button>
            <button className="avatarIconBlock" type="button" aria-label="Профіль">
              <img className="avatar" src={avatar} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>

      </header>
    </>
  );
}

export default Header;
