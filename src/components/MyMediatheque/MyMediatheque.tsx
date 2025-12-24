// MyMediatheque.tsx
import './MyMediatheque.css';
import { useEffect, useMemo, useState } from 'react';

import SongCard from '../SongCard/SongCard';
import ArtistBubble from '../ArtistBubble/ArtistBubble';
import PodcastCard from '../PodcastCard/PodcastCard';
import AudioBookCard from '../AudioBookCard/AudioBookCard';

import leftArrowDark from '../../assets/leftArrowDark.svg';
import leftArrowLight from '../../assets/leftArrowLight.svg';
import rightArrowDark from '../../assets/rightArrowDark.svg';
import rightArrowLight from '../../assets/rightArrowLight.svg';

import {
  fetchFavoritesArtistsFromDb,
  getCurrentUserId,
  fetchArtists,
} from '../../api/services';

import type { Track, ArtistLink, PodcastEpisode, AudioBook } from '../../api/types';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';
import { useSearch, norm } from '../SearchProvider/SearchProvider';

const TRACKS_PAGE = 7;
const ARTISTS_PAGE = 5;
const PODCASTS_PAGE = 4; 
const AUDIOBOOKS_PAGE = 1; 

function MyMediatheque() {
  const [favArtists, setFavArtists] = useState<ArtistLink[]>([]);
  const [artistsDict, setArtistsDict] = useState<Record<string, ArtistLink>>({});

  const [tIdx, setTIdx] = useState(0);
  const [aIdx, setAIdx] = useState(0);
  const [pIdx, setPIdx] = useState(0);
  const [abIdx, setAbIdx] = useState(0);

  const userId = getCurrentUserId();
  const { favorites, playTrack, playPodcast, playAudioBook } = usePlayback();
  const { query } = useSearch();

  // загрузка справочника артистов и подписок
  useEffect(() => {
    (async () => {
      try {
        const [allArtists, favA] = await Promise.all([fetchArtists(), fetchFavoritesArtistsFromDb(userId)]);
        setArtistsDict(Object.fromEntries(allArtists.map(a => [a.id, a])));
        setFavArtists([...favA.artists].reverse());
      } catch (e) {
        console.error('Load fav artists error', e);
        setArtistsDict({});
        setFavArtists([]);
      }
    })();
  }, [userId]);

  // реактивные избранные из провайдера плеера
  const favTracks: Track[] = useMemo(() => [...favorites.tracks], [favorites.tracks]);
  const favPodcasts: PodcastEpisode[] = useMemo(() => [...favorites.podcasts], [favorites.podcasts]);
  const favAudioBooks: AudioBook[] = useMemo(() => [...favorites.audiobooks], [favorites.audiobooks]);

  // ---------- поиск ----------
  const q = norm(query);
  const includes = (s: string) => norm(s).includes(q);

  const tracksFiltered = useMemo(() => {
    if (!q) return favTracks;
    return favTracks.filter(t => includes(t.name) || includes(artistsDict[t.artistid]?.name ?? ''));
  }, [q, favTracks, artistsDict]);

  const artistsFiltered = useMemo(() => {
    if (!q) return favArtists;
    return favArtists.filter(a => includes(a.name));
  }, [q, favArtists]);

  const podcastsFiltered = useMemo(() => {
    if (!q) return favPodcasts;
    return favPodcasts.filter(p => includes(p.title) || includes(p.host));
  }, [q, favPodcasts]);

  const audiobooksFiltered = useMemo(() => {
    if (!q) return favAudioBooks;
    return favAudioBooks.filter(ab => includes(ab.title) || includes(ab.author));
  }, [q, favAudioBooks]);

  // сброс индексов при изменениях наборов
  useEffect(() => { if (tIdx  > Math.max(0, tracksFiltered.length     - 1)) setTIdx(0);  }, [tracksFiltered.length, tIdx]);
  useEffect(() => { if (aIdx  > Math.max(0, artistsFiltered.length    - 1)) setAIdx(0);  }, [artistsFiltered.length, aIdx]);
  useEffect(() => { if (pIdx  > Math.max(0, podcastsFiltered.length   - 1)) setPIdx(0);  }, [podcastsFiltered.length, pIdx]);
  useEffect(() => { if (abIdx > Math.max(0, audiobooksFiltered.length - 1)) setAbIdx(0); }, [audiobooksFiltered.length, abIdx]);

  // страницы
  const tracksPage      = useMemo(() => tracksFiltered.slice(tIdx,  tIdx  + TRACKS_PAGE),         [tracksFiltered, tIdx]);
  const artistsPage     = useMemo(() => artistsFiltered.slice(aIdx, aIdx + ARTISTS_PAGE),         [artistsFiltered, aIdx]);
  const podcastsPage    = useMemo(() => podcastsFiltered.slice(pIdx, pIdx + PODCASTS_PAGE),       [podcastsFiltered, pIdx]);
  const audioBooksPage  = useMemo(() => audiobooksFiltered.slice(abIdx, abIdx + AUDIOBOOKS_PAGE), [audiobooksFiltered, abIdx]);

  // флаги
  const canPrevT  = tIdx  > 0;                               const canNextT  = tIdx  + TRACKS_PAGE     < tracksFiltered.length;
  const canPrevA  = aIdx  > 0;                               const canNextA  = aIdx  + ARTISTS_PAGE    < artistsFiltered.length;
  const canPrevP  = pIdx  > 0;                               const canNextP  = pIdx  + PODCASTS_PAGE   < podcastsFiltered.length;
  const canPrevAB = abIdx > 0;                               const canNextAB = abIdx + AUDIOBOOKS_PAGE < audiobooksFiltered.length;

  // хендлеры
  const prevT  = () => canPrevT  && setTIdx(tIdx - 1);
  const nextT  = () => canNextT  && setTIdx(tIdx + 1);
  const prevA  = () => canPrevA  && setAIdx(aIdx - 1);
  const nextA  = () => canNextA  && setAIdx(aIdx + 1);
  const prevP  = () => canPrevP  && setPIdx(pIdx - 1);
  const nextP  = () => canNextP  && setPIdx(pIdx + 1);
  const prevAB = () => canPrevAB && setAbIdx(abIdx - 1);
  const nextAB = () => canNextAB && setAbIdx(abIdx + 1);

  return (
    <div className="myMediatheque">
      <div className="mediathequeContentBlock">
        <div className='mediathequeTitleBlock'>
          <span className='mediathequeTitle'>Моя медіатека</span>
        </div>

        {/* Улюблені треки */}
        <section className='myFavTracksSection'>
          <div className='myFavTracksTitleBlock'>
            <span className='myFavTracksTitle'>Улюблені треки</span>
            <div className='directionButtonsBlock'>
              <button className="arrowBtn" onClick={nextT} aria-label="Наступні треки"   disabled={!canNextT}>
                <img className='rightArrow' src={canNextT ? leftArrowLight  : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button className="arrowBtn" onClick={prevT} aria-label="Попередні треки" disabled={!canPrevT}>
                <img className='leftArrow'  src={canPrevT ? rightArrowLight : rightArrowDark}  alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className='myFavSongCardsGrid'>
            {tracksPage.map(t => (
              <SongCard
                key={t.id}
                id={t.id}
                coverSrc={t.cover}
                title={t.name}
                artists={artistsDict[t.artistid]?.name ?? '—'}
                onPlay={playTrack}
              />
            ))}
          </div>
        </section>

        {/* Улюблені виконавці */}
        <section className='myFavArtistsSection'>
          <div className='myFavArtistsTitleBlock'>
            <span className='myFavArtistsTitle'>Твої улюблені виконавці</span>
            <div className='directionButtonsBlock'>
              <button className="arrowBtn" onClick={nextA} aria-label="Наступні виконавці"   disabled={!canNextA}>
                <img className='rightArrow' src={canNextA ? leftArrowLight : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button className="arrowBtn" onClick={prevA} aria-label="Попередні виконавці" disabled={!canPrevA}>
                <img className='leftArrow'  src={canPrevA ? rightArrowLight  : rightArrowDark}  alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className='myFavArtistsCardsGrid'>
            {artistsPage.map(a => (
              <ArtistBubble key={a.id} avatar={a.photo} artist={a.name} listeners={a.listeners} href="#" />
            ))}
          </div>
        </section>

        {/* Улюблені подкасти */}
        <section className='myFavPodcastsSection'>
          <div className='myFavPodcastsTitleBlock'>
            <span className='myFavPodcastsTitle'>Твої улюблені подкасти</span>
            <div className='directionButtonsBlock'>
              <button className="arrowBtn" onClick={nextP} aria-label="Наступні подкасти"   disabled={!canNextP}>
                <img className='rightArrow' src={canNextP ? leftArrowLight  : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button className="arrowBtn" onClick={prevP} aria-label="Попередні подкасти" disabled={!canPrevP}>
                <img className='leftArrow'  src={canPrevP ? rightArrowLight : rightArrowDark}  alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className='myFavPodcastsCardsGrid'>
            {podcastsPage.map(p => (
              <PodcastCard
                key={p.id}
                title={p.title}
                subtitle={p.host}
                cover={p.cover_image}
                date={new Date(p.created_at).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}
                duration={`${Math.round(p.duration_seconds / 3600)} год.`}
                description={p.info}
                href="#"
                onPlay={() => playPodcast(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Улюблені аудіокниги (по одній) */}
        <section className='myFavAudiobooksSection'>
          <div className='myFavAudiobooksTitleBlock'>
            <span className='myFavAudiobooksTitle'>Твої улюблені аудиокниги</span>
            <div className='directionButtonsBlock'>
              <button className="arrowBtn" onClick={nextAB} aria-label="Наступна аудіокнига"   disabled={!canNextAB}>
                <img className='rightArrow' src={canNextAB ? leftArrowLight  : leftArrowDark} alt="" aria-hidden="true" />
              </button>
              <button className="arrowBtn" onClick={prevAB} aria-label="Попередня аудіокнига" disabled={!canPrevAB}>
                <img className='leftArrow'  src={canPrevAB ? rightArrowLight : rightArrowDark}  alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className='myFavAudiobooksCardsGrid'>
            {audioBooksPage.map(ab => (
              <AudioBookCard
                key={ab.id}
                cover={ab.cover_image}
                title={ab.title}
                author={ab.author}
                genre={ab.genreid}
                description={ab.info}
                date={new Date(ab.created_at).toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}
                duration={`${Math.round(ab.duration_seconds / 3600)} год.`}
                href="#"
                onPlay={() => playAudioBook(ab.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyMediatheque;
