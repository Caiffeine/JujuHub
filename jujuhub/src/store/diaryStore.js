import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useDiaryStore = create((set) => ({
  entries: JSON.parse(localStorage.getItem("jujuhub-diary")) || [],

  addEntry: (content, mood) => {
    const newEntry = {
      id: uuidv4(),
      content,
      mood,
      date: new Date().toISOString(),
    };

    set((state) => {
      const updatedEntries = [...state.entries, newEntry];
      localStorage.setItem("jujuhub-diary", JSON.stringify(updatedEntries));
      return { entries: updatedEntries };
    });
  },

  updateEntry: (id, updatedData) => {
    set((state) => {
      const updatedEntries = state.entries.map((entry) =>
        entry.id === id ? { ...entry, ...updatedData } : entry
      );
      localStorage.setItem("jujuhub-diary", JSON.stringify(updatedEntries));
      return { entries: updatedEntries };
    });
  },

  deleteEntry: (id) => {
    set((state) => {
      const updatedEntries = state.entries.filter((entry) => entry.id !== id);
      localStorage.setItem("jujuhub-diary", JSON.stringify(updatedEntries));
      return { entries: updatedEntries };
    });
  },

  getEntriesByDate: (startDate, endDate) => {
    return (state) => {
      if (!startDate && !endDate) return state.entries;

      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Infinity;

      return state.entries.filter((entry) => {
        const entryTime = new Date(entry.date).getTime();
        return entryTime >= start && entryTime <= end;
      });
    };
  },
}));

export default useDiaryStore;
