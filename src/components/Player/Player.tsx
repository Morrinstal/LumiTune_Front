import './Player.css';
import React, { useRef, useState, useEffect } from 'react';
import heartSolar from '../../assets/heartSolar.svg';
import heartUmbra from '../../assets/heartUmbra.svg';
import repeatIcon from '../../assets/repeat.svg';
import shuffleIcon from '../../assets/shuffle.svg';
import arrowLeft from '../../assets/arrowPrevious.svg';
import arrowRight from '../../assets/arrowNext.svg';
import playIcon from '../../assets/playIcon.svg';
import pauseIcon from '../../assets/stopIcon.svg';
import volumeIcon from '../../assets/volumeIcon.svg';
import { usePlayback } from '../PlaybackProvider/PlaybackProvider';

type PlayerProps = {
  // всё ниже — НЕ обязательно. Будет использовано только если очередь провайдера пустая.
  songSrc?:       string | null;
  songImage?:     string | null;
  songTitle?:     string | null;
  artistName?:    string | null;
  currentSongId?: number | null;
  songs?: { id: number | string; musicFile?: string }[];
  onSongChange?: (songId: number) => void;
};

function Player({
  songSrc:       propSrc,
  songImage:     propImg,
  songTitle:     propTitle,
  artistName:    propArtist,
  currentSongId: propCurrentNumId,
  songs:         propSongs = [],
  onSongChange,
}: PlayerProps) {
  const {
    mode, currentId,
    src: ctxSrc, img: ctxImg, title: ctxTitle, byline,
    queue, playTrack, playAudioBook, playPodcast,
    isCurrentFavorite, toggleFavoriteCurrent
  } = usePlayback();

  // используем контекст как primary-источник
  const activeSrc   = ctxSrc ?? propSrc ?? null;
  const activeImg   = ctxImg ?? propImg ?? null;
  const activeTitle = ctxTitle ?? propTitle ?? null;
  const activeBy    = byline ?? propArtist ?? null;

  const queueIds = queue?.ids ?? [];
  const hasCtxQueue = Array.isArray(queueIds) && queueIds.length > 0;

  // для fallback-а вычислим индекс по пропсам
  const fallbackIds = (propSongs || []).map(s => String(s.id));
  const currentStrId = currentId ?? (propCurrentNumId != null ? String(propCurrentNumId) : null);

  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(0.5);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // === Когда меняется src — ставим и играем
  useEffect(() => {
    if (!audioRef.current || !activeSrc) return;
    audioRef.current.src = activeSrc;
    audioRef.current.loop = isRepeating;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [activeSrc, isRepeating]);

  // на смену currentId сбрасываем прогресс
  useEffect(() => {
    setCurrentTime(0);
  }, [currentId]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.pause();
    else a.play().catch(() => {});
    setIsPlaying(p => !p);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const getCtxIndex = () => {
    if (!hasCtxQueue || !currentStrId) return -1;
    return queueIds.indexOf(String(currentStrId));
  };

  const playById = async (id: string) => {
    if (!id) return;
    if (mode === 'track')     await playTrack(id);
    else if (mode === 'audiobook') await playAudioBook(id);
    else                      await playPodcast(id);
  };

  const getRandomFrom = (ids: string[], exclude: string | null) => {
    if (!ids.length) return null;
    let attempt = 0;
    while (attempt < 10) {
      const idx = Math.floor(Math.random() * ids.length);
      const chosen = ids[idx];
      if (!exclude || chosen !== exclude) return chosen;
      attempt++;
    }
    return ids[0]; // fallback
  };

  const handleSkip = async (dir: -1 | 1) => {
    // 1) Путь через очередь провайдера (основной)
    if (hasCtxQueue) {
      if (!currentStrId) return;
      const curIdx = getCtxIndex();
      if (curIdx < 0) return;

      let nextId: string | null = null;

      if (isShuffling) {
        nextId = getRandomFrom(queueIds, currentStrId);
      } else {
        const n = queueIds.length;
        const nextIdx = (curIdx + dir + n) % n;
        nextId = queueIds[nextIdx] ?? null;
      }
      if (nextId && nextId !== currentStrId) {
        await playById(nextId);
      }
      return;
    }

    // 2) Fallback: работаем с пропсами (старый путь)
    if (!propSongs.length || propCurrentNumId == null) return;

    const ids = fallbackIds;
    const cur = String(propCurrentNumId);
    const curIdx = ids.indexOf(cur);
    if (curIdx < 0) return;

    let target: string | null = null;

    if (isShuffling) {
      target = getRandomFrom(ids, cur);
    } else {
      const n = ids.length;
      const nextIdx = (curIdx + dir + n) % n;
      target = ids[nextIdx] ?? null;
    }

    if (target && onSongChange) {
      onSongChange(Number(target)); // оставил совместимость по типу
    }
  };

  const handleSkipPrevious = () => { void handleSkip(-1); };
  const handleSkipNext     = () => { void handleSkip(1);  };

  const handleRepeatToggle  = () => setIsRepeating(p => !p);
  const handleShuffleToggle = () => setIsShuffling(p => !p);

  const handleEnded = () => {
    if (isRepeating) {
      // просто перевоспроизводим текущий src
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
      return;
    }
    handleSkipNext();
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.onended = handleEnded;
  }, [currentStrId, isRepeating, isShuffling, hasCtxQueue, queueIds.join('|')]);

  // ===== Seek =====
  const seekRef = useRef<HTMLDivElement | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  const clientXToTime = (clientX: number) => {
    if (!seekRef.current || !duration || !audioRef.current) return;
    const rect = seekRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const t = (x / rect.width) * duration;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };
  const onSeekMouseDown = (e: React.MouseEvent) => { setIsSeeking(true); clientXToTime(e.clientX); };
  const onSeekMouseMove = (e: React.MouseEvent) => { if (isSeeking) clientXToTime(e.clientX); };
  const onSeekMouseUp = () => setIsSeeking(false);
  const onSeekMouseLeave = () => setIsSeeking(false);
  const onSeekTouchStart = (e: React.TouchEvent) => { setIsSeeking(true); clientXToTime(e.touches[0].clientX); };
  const onSeekTouchMove = (e: React.TouchEvent) => { if (isSeeking) clientXToTime(e.touches[0].clientX); };
  const onSeekTouchEnd = () => setIsSeeking(false);

  // ===== Volume =====
  const volRef = useRef<HTMLDivElement | null>(null);
  const [isVolSeeking, setIsVolSeeking] = useState(false);

  const pctToVolume = (px: number, width: number) => Math.min(1, Math.max(0, px / width));
  const clientXToVolume = (clientX: number) => {
    if (!volRef.current || !audioRef.current) return;
    const rect = volRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const v = pctToVolume(x, rect.width);
    audioRef.current.volume = v;
    setVolume(v);
  };
  const onVolMouseDown = (e: React.MouseEvent) => { setIsVolSeeking(true); clientXToVolume(e.clientX); };
  const onVolMouseMove = (e: React.MouseEvent) => { if (isVolSeeking) clientXToVolume(e.clientX); };
  const onVolMouseUp = () => setIsVolSeeking(false);
  const onVolMouseLeave = () => setIsVolSeeking(false);
  const onVolTouchStart = (e: React.TouchEvent) => { setIsVolSeeking(true); clientXToVolume(e.touches[0].clientX); };
  const onVolTouchMove = (e: React.TouchEvent) => { if (isVolSeeking) clientXToVolume(e.touches[0].clientX); };
  const onVolTouchEnd = () => setIsVolSeeking(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, activeSrc]);

  const fmt = (sec: number) => {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className='lumitune-player'>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className='info-controls-block'>
        <div className='track-info'>
          {activeImg && <img src={activeImg} className="track-image" alt="track" />}
          <div className='track-details'>
            <span className="track-title">{activeTitle ?? ''}</span>
            <span className="track-artist">{activeBy ?? ''}</span>
          </div>

          <button
            type="button"
            className={`heart-btn ${isCurrentFavorite ? 'active' : ''}`}
            onClick={toggleFavoriteCurrent}
            aria-pressed={isCurrentFavorite}
            title={isCurrentFavorite ? 'Видалити з улюбленого' : 'Додати в улюблене'}
          >
            <img
              src={isCurrentFavorite ? heartSolar : heartUmbra}
              className='heart-icon'
              alt={isCurrentFavorite ? 'Улюблене' : 'Додати в улюблене'}
            />
          </button>
        </div>

        <div className='player-center-block'>
          <div className='player-controls'>
            <button
              type='button'
              className={`btn-side ${isRepeating ? 'active' : 'inactive'}`}
              onClick={handleRepeatToggle}
            >
              <img src={repeatIcon} className='icon-side' alt='Repeat' />
            </button>

            <button type='button' className='btn-arrow' onClick={handleSkipPrevious}>
              <img src={arrowLeft} className='icon-arrow' alt='Previous Track' />
            </button>

            {isPlaying ? (
              <button type='button' className="btn-play-pause" onClick={togglePlay}>
                <img src={pauseIcon} className='icon-play-pause' alt='Pause' />
              </button>
            ) : (
              <button type='button' className="btn-play-pause" onClick={togglePlay}>
                <img src={playIcon} className='icon-play-pause' alt='Play' />
              </button>
            )}

            <button type='button' className='btn-arrow' onClick={handleSkipNext}>
              <img src={arrowRight} className='icon-arrow' alt='Next Track' />
            </button>

            <button
              type='button'
              className={`btn-side ${isShuffling ? 'active' : 'inactive'}`}
              onClick={handleShuffleToggle}
            >
              <img src={shuffleIcon} className='icon-side' alt='Shuffle' />
            </button>
          </div>

          <div className='progress-bar'>
            <span className='player-time'>{fmt(currentTime)}</span>

            <div
              className='seek'
              ref={seekRef}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration) || 0}
              aria-valuenow={Math.floor(currentTime) || 0}
              aria-label="Seek"
              onMouseDown={onSeekMouseDown}
              onMouseMove={onSeekMouseMove}
              onMouseUp={onSeekMouseUp}
              onMouseLeave={onSeekMouseLeave}
              onTouchStart={onSeekTouchStart}
              onTouchMove={onSeekTouchMove}
              onTouchEnd={onSeekTouchEnd}
            >
              <div className='seek__bar' style={{ width: `${progressPct}%` }} />
              <div className='seek__thumb' style={{ left: `${progressPct}%` }} />
            </div>

            <span className='player-time'>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <div className='volume-fullscreen-block'>
        <div className='volume-block'>
          <img src={volumeIcon} className='icon-volume' alt='Volume' />
          <div
            className='vol-seek'
            ref={volRef}
            role='slider'
            aria-label='Volume'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            onMouseDown={onVolMouseDown}
            onMouseMove={onVolMouseMove}
            onMouseUp={onVolMouseUp}
            onMouseLeave={onVolMouseLeave}
            onTouchStart={onVolTouchStart}
            onTouchMove={onVolTouchMove}
            onTouchEnd={onVolTouchEnd}
          >
            <div className='vol-seek__bar' style={{ width: `${volume * 100}%` }} />
            <div className='vol-seek__thumb' style={{ left: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
