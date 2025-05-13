import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useBooksStore from '../../store/booksStore';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Books.css';

const STATUS_OPTIONS = [
  { value: 'to-read', label: 'To Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'done', label: 'Completed' }
];

const Books = () => {
  const { books, addBook, updateBook, deleteBook } = useBooksStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentBook, setCurrentBook] = useState({
    id: null,
    title: '',
    author: '',
    coverUrl: '',
    status: 'to-read',
    notes: ''
  });
  
  // Filter books by status if filter is applied
  const filteredBooks = statusFilter
    ? books.filter(book => book.status === statusFilter)
    : books;
  
  const handleOpenModal = (book = null) => {
    if (book) {
      setCurrentBook({ ...book });
    } else {
      setCurrentBook({
        id: null,
        title: '',
        author: '',
        coverUrl: '',
        status: 'to-read',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveBook = (e) => {
    e.preventDefault();
    
    if (!currentBook.title.trim() || !currentBook.author.trim()) {
      Swal.fire({
        title: 'Oops!',
        text: 'Please enter both title and author',
        icon: 'warning',
        confirmButtonColor: '#f5a8b9',
      });
      return;
    }
    
    if (currentBook.id) {
      updateBook(currentBook.id, {
        title: currentBook.title,
        author: currentBook.author,
        coverUrl: currentBook.coverUrl,
        status: currentBook.status,
        notes: currentBook.notes
      });
    } else {
      addBook(
        currentBook.title,
        currentBook.author,
        currentBook.coverUrl,
        currentBook.status,
        currentBook.notes
      );
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentBook.id ? 'Book updated successfully' : 'Book added successfully',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteBook = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f5a8b9',
      cancelButtonColor: '#b6cae3',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBook(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your book has been removed from the list.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  const handleStatusChange = (id, newStatus) => {
    updateBook(id, { status: newStatus });
    
    if (newStatus === 'done') {
      Swal.fire({
        title: 'Congratulations!',
        text: 'You finished another book! 🎉',
        icon: 'success',
        confirmButtonColor: '#f5a8b9',
      });
    }
  };
  
  return (
    <div className="books-container">
      <div className="books-header">
        <h1 className="page-title">My Books</h1>
        <div className="books-actions">
          <div className="status-filter">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Books</option>
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => handleOpenModal()}
          >
            Add Book
          </Button>
        </div>
      </div>
      
      {filteredBooks.length === 0 ? (
        <div className="books-empty">
          <p>
            {statusFilter
              ? `No books in the "${STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}" category`
              : "You haven't added any books yet. Add your first book!"}
          </p>
        </div>
      ) : (
        <div className="books-grid">
          <AnimatePresence>
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                className="book-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="book-cover">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} />
                  ) : (
                    <div className="book-cover-placeholder">
                      <span className="book-title-small">{book.title}</span>
                      <span className="book-author-small">by {book.author}</span>
                    </div>
                  )}
                  <div className="book-status">
                    <span className={`status-badge ${book.status}`}>
                      {STATUS_OPTIONS.find(s => s.value === book.status)?.label}
                    </span>
                  </div>
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  
                  {book.notes && (
                    <p className="book-notes">{book.notes}</p>
                  )}
                  
                  <div className="book-actions">
                    <div className="status-actions">
                      {book.status !== 'to-read' && (
                        <button
                          className="status-btn to-read"
                          onClick={() => handleStatusChange(book.id, 'to-read')}
                        >
                          To Read
                        </button>
                      )}
                      {book.status !== 'reading' && (
                        <button
                          className="status-btn reading"
                          onClick={() => handleStatusChange(book.id, 'reading')}
                        >
                          Reading
                        </button>
                      )}
                      {book.status !== 'done' && (
                        <button
                          className="status-btn done"
                          onClick={() => handleStatusChange(book.id, 'done')}
                        >
                          Done
                        </button>
                      )}
                    </div>
                    <div className="edit-actions">
                      <button
                        className="book-action edit"
                        onClick={() => handleOpenModal(book)}
                        aria-label="Edit book"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="book-action delete"
                        onClick={() => handleDeleteBook(book.id)}
                        aria-label="Delete book"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentBook.id ? 'Edit Book' : 'Add New Book'}
      >
        <form onSubmit={handleSaveBook} className="book-form">
          <div className="form-group">
            <label htmlFor="book-title">Title</label>
            <input
              id="book-title"
              type="text"
              value={currentBook.title}
              onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
              placeholder="Enter book title..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="book-author">Author</label>
            <input
              id="book-author"
              type="text"
              value={currentBook.author}
              onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })}
              placeholder="Enter author name..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="book-cover">Cover Image URL (optional)</label>
            <input
              id="book-cover"
              type="text"
              value={currentBook.coverUrl}
              onChange={(e) => setCurrentBook({ ...currentBook, coverUrl: e.target.value })}
              placeholder="Enter image URL..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="book-status">Reading Status</label>
            <select
              id="book-status"
              value={currentBook.status}
              onChange={(e) => setCurrentBook({ ...currentBook, status: e.target.value })}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="book-notes">Notes/Review (optional)</label>
            <textarea
              id="book-notes"
              value={currentBook.notes}
              onChange={(e) => setCurrentBook({ ...currentBook, notes: e.target.value })}
              placeholder="Write your thoughts or review..."
              rows={4}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Book
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Books;
