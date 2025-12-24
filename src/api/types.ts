export type ArtistLink = {
  id: string; 
  name: string; 
  description: string; 
  photo: string; 
  listeners: string;
};

export type Track = {
  id: string; 
  name: string; 
  artistid: string; 
  genreid: string; 
  albumid?: string; 
  playsnum: string; 
  adult: boolean; 
  time: number; 
  audio: string; 
  cover: string; 
  created_at: string;
  
};

// types.ts
export type Playlist = {
  id: string;
  title: string;
  description: string;
  cover: string;
  owner_id: string;     // id юзера/артиста (как сейчас с бэка)
  artist_id?: string;   // бэк тоже может прислать
  created_at: string;

  // НОВОЕ (необязательные — чтобы не ломать список /playlists)
  tracks?: Track[];         // приходит, если вы дергаете /playlists/<id>/?full=1
  tracks_count?: number;    // приходит/считается на бэке
  artist_display?: string;
};

export type PlaylistItem = {
  id: string; 
  playlist_id: string; 
  track: string; 
  position: string;
};

export type AudioBook = {
  id: string; 
  title: string; 
  author: string; 
  author_fk_id: string; 
  genreid: string;
  playsnum: number; 
  adult: boolean; 
  duration_seconds: number; 
  info: string; 
  chapter: number;
  audio_file: string; 
  cover_image: string; 
  created_at: string; 
  update_at: string;
};

export type PodcastEpisode = {
  id: string; 
  title: string; 
  episode: number; 
  host: string; 
  host_fk_id: string; 
  genreid: string;
  playsnum: number; 
  adult: boolean; 
  duration_seconds: number; 
  info: string;
  audio_file: string; 
  cover_image: string; 
  created_at: string; 
  update_at: string;
};
