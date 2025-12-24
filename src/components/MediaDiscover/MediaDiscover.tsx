// MediaDiscover.tsx
import './MediaDiscover.css';
import { useEffect, useState, useCallback, useMemo } from 'react';
import PodcastCard from '../PodcastCard/PodcastCard';
import AudioBookCard from '../AudioBookCard/AudioBookCard';
import { fetchPodcasts, fetchAudioBooks } from '../../api/services';
import type { PodcastEpisode, AudioBook } from '../../api/types';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';
import { useSearch, norm } from '../SearchProvider/SearchProvider';

import leftArrowDark from '../../assets/leftArrowDark.svg';
import leftArrowLight from '../../assets/leftArrowLight.svg';
import rightArrowDark from '../../assets/rightArrowDark.svg';
import rightArrowLight from '../../assets/rightArrowLight.svg';

const POD_PAGE = 3;
const AB_PAGE = 3;
const POP_POD_PAGE = 3;
const POP_AB_PAGE = 1; // показываем по одной

function MediaDiscover() {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [audiobooks, setAudiobooks] = useState<AudioBook[]>([]);

  // индексы окон
  const [podIdxNew, setPodIdxNew] = useState(0);
  const [abIdxNew, setAbIdxNew] = useState(0);
  const [podIdxPop, setPodIdxPop] = useState(0);
  const [abIdxPop, setAbIdxPop] = useState(0);

  const { playPodcast, playAudioBook } = usePlayback();
  const { query } = useSearch();

  useEffect(() => {
    (async () => {
      // тянем без лимитов, чтобы было что листать
      const [p, ab] = await Promise.all([fetchPodcasts(), fetchAudioBooks()]);
      setPodcasts(p);
      setAudiobooks(ab);

      // сброс стартовых окон
      setPodIdxNew(0);
      setAbIdxNew(0);
      setPodIdxPop(0);
      setAbIdxPop(0);
    })();
  }, []);

  const handlePlayPodcast = useCallback((id: string) => { playPodcast(id); }, [playPodcast]);
  const handlePlayAudioBook = useCallback((id: string) => { playAudioBook(id); }, [playAudioBook]);

  const q = norm(query);
  const includes = (s: string) => norm(s).includes(q);

  const podcastsFiltered = useMemo(() => {
    if (!q) return podcasts;
    return podcasts.filter(p => includes(p.title) || includes(p.host));
  }, [q, podcasts]);

  const audiobooksFiltered = useMemo(() => {
    if (!q) return audiobooks;
    return audiobooks.filter(ab => includes(ab.title) || includes(ab.author));
  }, [q, audiobooks]);

  // сброс индексов, если длины меняются
  useEffect(() => { if (podIdxNew > Math.max(0, podcastsFiltered.length - 1)) setPodIdxNew(0); },
    [podcastsFiltered.length, podIdxNew]);
  useEffect(() => { if (podIdxPop > Math.max(0, podcastsFiltered.length - 1)) setPodIdxPop(0); },
    [podcastsFiltered.length, podIdxPop]);
  useEffect(() => { if (abIdxNew > Math.max(0, audiobooksFiltered.length - 1)) setAbIdxNew(0); },
    [audiobooksFiltered.length, abIdxNew]);
  useEffect(() => { if (abIdxPop > Math.max(0, audiobooksFiltered.length - 1)) setAbIdxPop(0); },
    [audiobooksFiltered.length, abIdxPop]);

  // окна
  const newPodsPage = podcastsFiltered.slice(podIdxNew, podIdxNew + POD_PAGE);
  const newABPage   = audiobooksFiltered.slice(abIdxNew, abIdxNew + AB_PAGE);
  const popPodsPage = podcastsFiltered.slice(podIdxPop, podIdxPop + POP_POD_PAGE);
  const popABPage   = audiobooksFiltered.slice(abIdxPop, abIdxPop + POP_AB_PAGE); // по одной

  // доступность
  const canPrevPodNew = podIdxNew > 0;
  const canNextPodNew = podIdxNew + POD_PAGE < podcastsFiltered.length;

  const canPrevABNew = abIdxNew > 0;
  const canNextABNew = abIdxNew + AB_PAGE < audiobooksFiltered.length;

  const canPrevPodPop = podIdxPop > 0;
  const canNextPodPop = podIdxPop + POP_POD_PAGE < podcastsFiltered.length;

  const canPrevABPop = abIdxPop > 0;
  const canNextABPop = abIdxPop + POP_AB_PAGE < audiobooksFiltered.length;

  // хендлеры (двиг по одному)
  const goPrevPodNew = () => canPrevPodNew && setPodIdxNew(i => i - 1);
  const goNextPodNew = () => canNextPodNew && setPodIdxNew(i => i + 1);

  const goPrevABNew  = () => canPrevABNew && setAbIdxNew(i => i - 1);
  const goNextABNew  = () => canNextABNew && setAbIdxNew(i => i + 1);

  const goPrevPodPop = () => canPrevPodPop && setPodIdxPop(i => i - 1);
  const goNextPodPop = () => canNextPodPop && setPodIdxPop(i => i + 1);

  const goPrevABPop  = () => canPrevABPop && setAbIdxPop(i => i - 1);
  const goNextABPop  = () => canNextABPop && setAbIdxPop(i => i + 1);

  return (
    <div className='mediaDiscover'>
      <div className='mediaContentBlock'>

        {/* Нові релізи подкастів */}
        <section className='newPodcasts'>
          <div className='mediaTitle_block'>
            <span className='mediaTitle'>Нові релізи подкастів</span>
            <div className='directionButtonsBlock'>
              {/* ПРАВАЯ — вперёд (левый ярлык) */}
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextPodNew}
                aria-label="Наступні подкасти"
                disabled={!canNextPodNew}
              >
                <img className='rightArrow' src={canNextPodNew ? leftArrowLight : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              {/* ЛЕВАЯ — назад (правый ярлык) */}
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevPodNew}
                aria-label="Попередні подкасти"
                disabled={!canPrevPodNew}
              >
                <img className='leftArrow' src={canPrevPodNew ? rightArrowLight : rightArrowDark} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className='cardsGrid'>
            {newPodsPage.map(p => (
              <PodcastCard
                key={p.id}
                title={p.title}
                subtitle={p.host}
                cover={p.cover_image}
                date={new Date(p.created_at).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}
                duration={`${Math.round(p.duration_seconds / 3600)} год.`}
                description={p.info}
                href="#"
                onPlay={() => handlePlayPodcast(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Нові релізи аудиокниг */}
        <section className='newAudioBooks'>
          <div className='mediaTitle_block'>
            <span className='mediaTitle'>Нові релізи аудиокниг</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextABNew}
                aria-label="Наступні аудіокниги"
                disabled={!canNextABNew}
              >
                <img className='rightArrow' src={canNextABNew ? leftArrowLight : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevABNew}
                aria-label="Попередні аудіокниги"
                disabled={!canPrevABNew}
              >
                <img className='leftArrow' src={canPrevABNew ? rightArrowLight : rightArrowDark} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className='newAB_Grid'>
            {audiobooksFiltered.map(ab => (
              <AudioBookCard
                key={ab.id}
                title={ab.title}
                cover={ab.cover_image}
                author={ab.author}
                genre={ab.genreid}
                description={ab.info}
                date={new Date(ab.created_at).toLocaleDateString('uk-UA', { month:'short', year:'numeric' })}
                duration={`${Math.round(ab.duration_seconds / 3600)} год.`}
                href="#"
                onPlay={() => handlePlayAudioBook(ab.id)}
              />
            ))}
          </div>
        </section>

        {/* Популярні подкасти */}
        <section className='popularPodcasts'>
          <div className='mediaTitle_block'>
            <span className='mediaTitle'>Популярні подкасти</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextPodPop}
                aria-label="Наступні популярні подкасти"
                disabled={!canNextPodPop}
              >
                <img className='rightArrow' src={canNextPodPop ? leftArrowLight : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevPodPop}
                aria-label="Попередні популярні podкасти"
                disabled={!canPrevPodPop}
              >
                <img className='leftArrow' src={canPrevPodPop ? rightArrowLight : rightArrowDark} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className='cardsGrid'>
            {popPodsPage.map(p => (
              <PodcastCard
                key={`pop-${p.id}`}
                title={p.title}
                subtitle={p.host}
                cover={p.cover_image}
                date={new Date(p.created_at).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}
                duration={`${Math.round(p.duration_seconds / 3600)} год.`}
                description={p.info}
                href="#"
                onPlay={() => handlePlayPodcast(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Популярні аудиокниги — показываем по одной */}
        <section className='popularAudioBooks'>
          <div className='mediaTitle_block'>
            <span className='mediaTitle'>Популярні аудиокниги</span>
            <div className='directionButtonsBlock'>
              <button
                type="button"
                className="arrowBtn"
                onClick={goNextABPop}
                aria-label="Наступні популярні аудіокниги"
                disabled={!canNextABPop}
              >
                <img className='rightArrow' src={canNextABPop ? leftArrowLight : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="arrowBtn"
                onClick={goPrevABPop}
                aria-label="Попередні популярні аудіокниги"
                disabled={!canPrevABPop}
              >
                <img className='leftArrow' src={canPrevABPop ? rightArrowLight : rightArrowDark} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className='cardsGrid'>
            {popABPage.map(ab => (
              <AudioBookCard
                key={`popab-${ab.id}`}
                title={ab.title}
                cover={ab.cover_image}
                author={ab.author}
                genre={ab.genreid}
                description={ab.info}
                date={new Date(ab.created_at).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}
                duration={`${Math.round(ab.duration_seconds / 3600)} год.`}
                href="#"
                onPlay={() => handlePlayAudioBook(ab.id)}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default MediaDiscover;
