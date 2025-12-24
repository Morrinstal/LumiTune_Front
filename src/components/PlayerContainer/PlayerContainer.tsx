import { usePlayback } from '../PlaybackProvider/PlaybackProvider';
import Player from '../Player/Player';

export default function PlayerContainer() {
  const {
    src, img, title, byline,
    currentNumericId, queue, playByNumeric,
  } = usePlayback();

  return (
    <Player
      songSrc={src}
      songImage={img}
      songTitle={title}
      artistName={byline}
      currentSongId={currentNumericId}
      songs={queue.numeric.map((id, i) => ({ id, musicFile: '' }))} 
      onSongChange={playByNumeric}
    />
  );
}