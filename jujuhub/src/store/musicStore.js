import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useMusicStore = create((set) => ({
  tracks: JSON.parse(localStorage.getItem("jujuhub-music")) || [],

  addTrack: (title, artist, vibe, link = "") => {
    const newTrack = {
      id: uuidv4(),
      title,
      artist,
      vibe, // e.g. 'chill', 'upbeat', 'romantic', etc.
      link,
      addedAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedTracks = [...state.tracks, newTrack];
      localStorage.setItem("jujuhub-music", JSON.stringify(updatedTracks));
      return { tracks: updatedTracks };
    });
  },

  updateTrack: (id, updatedData) => {
    set((state) => {
      const updatedTracks = state.tracks.map((track) =>
        track.id === id ? { ...track, ...updatedData } : track
      );
      localStorage.setItem("jujuhub-music", JSON.stringify(updatedTracks));
      return { tracks: updatedTracks };
    });
  },

  deleteTrack: (id) => {
    set((state) => {
      const updatedTracks = state.tracks.filter((track) => track.id !== id);
      localStorage.setItem("jujuhub-music", JSON.stringify(updatedTracks));
      return { tracks: updatedTracks };
    });
  },

  getTracksByVibe: (vibe) => {
    return (state) => {
      if (!vibe) return state.tracks;
      return state.tracks.filter((track) => track.vibe === vibe);
    };
  },
}));

export default useMusicStore;
