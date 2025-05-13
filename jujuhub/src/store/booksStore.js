import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useBooksStore = create((set) => ({
  books: JSON.parse(localStorage.getItem("jujuhub-books")) || [],

  addBook: (title, author, coverUrl, status = "to-read", notes = "") => {
    const newBook = {
      id: uuidv4(),
      title,
      author,
      coverUrl,
      status, // 'to-read', 'reading', 'done'
      notes,
      addedAt: new Date().toISOString(),
      completedAt: null,
    };

    set((state) => {
      const updatedBooks = [...state.books, newBook];
      localStorage.setItem("jujuhub-books", JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });
  },

  updateBook: (id, updatedData) => {
    set((state) => {
      const updatedBooks = state.books.map((book) => {
        if (book.id === id) {
          // If status is being updated to 'done', set completedAt
          const completedAt =
            updatedData.status === "done" && book.status !== "done"
              ? new Date().toISOString()
              : book.completedAt;

          return {
            ...book,
            ...updatedData,
            completedAt,
          };
        }
        return book;
      });

      localStorage.setItem("jujuhub-books", JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });
  },

  deleteBook: (id) => {
    set((state) => {
      const updatedBooks = state.books.filter((book) => book.id !== id);
      localStorage.setItem("jujuhub-books", JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });
  },

  getBooksByStatus: (status) => {
    return (state) => {
      if (!status) return state.books;
      return state.books.filter((book) => book.status === status);
    };
  },
}));

export default useBooksStore;
