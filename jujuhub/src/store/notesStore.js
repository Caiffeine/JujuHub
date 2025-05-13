import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useNotesStore = create((set, get) => ({
  notes: JSON.parse(localStorage.getItem("jujuhub-notes")) || [],

  addNote: (title, content) => {
    const newNote = {
      id: uuidv4(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedNotes = [...state.notes, newNote];
      localStorage.setItem("jujuhub-notes", JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
  },

  updateNote: (id, updatedData) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updatedData,
              updatedAt: new Date().toISOString(),
            }
          : note
      );
      localStorage.setItem("jujuhub-notes", JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const updatedNotes = state.notes.filter((note) => note.id !== id);
      localStorage.setItem("jujuhub-notes", JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
  },

  searchNotes: (searchTerm) => {
    const { notes } = get();
    if (!searchTerm) return notes;

    const lowercasedTerm = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercasedTerm) ||
        note.content.toLowerCase().includes(lowercasedTerm)
    );
  },
}));

export default useNotesStore;
