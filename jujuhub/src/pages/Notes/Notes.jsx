import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useNotesStore from '../../store/notesStore';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Notes.css';

const Notes = () => {
  const { notes, addNote, updateNote, deleteNote, searchNotes } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '' });
  
  const filteredNotes = searchTerm ? searchNotes(searchTerm) : notes;
  
  const handleOpenModal = (note = null) => {
    if (note) {
      setCurrentNote({ id: note.id, title: note.title, content: note.content });
    } else {
      setCurrentNote({ id: null, title: '', content: '' });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveNote = (e) => {
    e.preventDefault();
    
    if (!currentNote.title.trim() || !currentNote.content.trim()) {
      let timerInterval;
      Swal.fire({
        title: 'Oops!',
        html: 'Please fill in both title and content.<br><br>Closing in <b></b> ms.',
        icon: 'warning',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector('b');
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      });
      return;
    }
    
    if (currentNote.id) {
      updateNote(currentNote.id, {
        title: currentNote.title,
        content: currentNote.content,
      });
    } else {
      addNote(currentNote.title, currentNote.content);
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentNote.id ? 'Note updated successfully' : 'Note added successfully',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteNote = (id) => {
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
        deleteNote(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your note has been deleted.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1 className="page-title">My Notes</h1>
        <div className="notes-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => handleOpenModal()}
          >
            Add Note
          </Button>
        </div>
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="notes-empty">
          <p>
            {searchTerm
              ? "No notes match your search"
              : "You don't have any notes yet. Create your first note!"}
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                className="note-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="note-content">
                  <h2 className="note-title">{note.title}</h2>
                  <p className="note-text">{note.content}</p>
                </div>
                <div className="note-footer">
                  <span className="note-date">
                    {format(new Date(note.updatedAt), 'MMM dd, yyyy')}
                  </span>
                  <div className="note-actions">
                    <button
                      className="note-action edit"
                      onClick={() => handleOpenModal(note)}
                      aria-label="Edit note"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="note-action delete"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Delete note"
                    >
                      <FaTrash />
                    </button>
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
        title={currentNote.id ? 'Edit Note' : 'Add New Note'}
      >
        <form onSubmit={handleSaveNote} className="note-form">
          <div className="form-group">
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              type="text"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              placeholder="Enter a title..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-content">Content</label>
            <textarea
              id="note-content"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              placeholder="Write your note here..."
              rows={8}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notes;
