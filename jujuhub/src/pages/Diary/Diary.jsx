import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useDiaryStore from '../../store/diaryStore';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Diary.css';

const MOODS = [
  { value: '😊', label: 'Happy' },
  { value: '🥰', label: 'Loved' },
  { value: '😌', label: 'Peaceful' },
  { value: '😔', label: 'Sad' },
  { value: '😡', label: 'Angry' },
  { value: '😰', label: 'Anxious' },
  { value: '🤔', label: 'Thoughtful' },
  { value: '😴', label: 'Tired' },
];

const Diary = () => {
  const { entries, addEntry, updateEntry, deleteEntry } = useDiaryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({ id: null, content: '', mood: '😊' });
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Filter by date if selected
  const filteredEntries = selectedDate 
    ? sortedEntries.filter(entry => {
        const entryDate = new Date(entry.date).toDateString();
        const filterDate = new Date(selectedDate).toDateString();
        return entryDate === filterDate;
      })
    : sortedEntries;
  
  const handleOpenModal = (entry = null) => {
    if (entry) {
      setCurrentEntry({ 
        id: entry.id, 
        content: entry.content, 
        mood: entry.mood 
      });
    } else {
      setCurrentEntry({ id: null, content: '', mood: '😊' });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveEntry = (e) => {
    e.preventDefault();
    
    if (!currentEntry.content.trim()) {
      let timerInterval;
      Swal.fire({
        title: 'Oops!',
        html: 'Please write something in your diary.<br><br>Closing in <b></b> ms.',
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
    
    if (currentEntry.id) {
      updateEntry(currentEntry.id, {
        content: currentEntry.content,
        mood: currentEntry.mood,
      });
    } else {
      addEntry(currentEntry.content, currentEntry.mood);
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentEntry.id ? 'Entry updated successfully' : 'Entry added successfully',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteEntry = (id) => {
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
        deleteEntry(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your diary entry has been deleted.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const clearDateFilter = () => {
    setSelectedDate(null);
  };
  
  return (
    <div className="diary-container">
      <div className="diary-header">
        <h1 className="page-title">My Diary</h1>
        <div className="diary-actions">
          <div className="date-filter">
            <FaCalendarAlt className="calendar-icon" />
            <input
              type="date"
              value={selectedDate || ''}
              onChange={handleDateChange}
            />
            {selectedDate && (
              <button className="clear-filter" onClick={clearDateFilter}>×</button>
            )}
          </div>
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => handleOpenModal()}
          >
            New Entry
          </Button>
        </div>
      </div>
      
      {filteredEntries.length === 0 ? (
        <div className="diary-empty">
          <p>
            {selectedDate
              ? "No entries found for this date"
              : "You haven't written any diary entries yet. Start journaling today!"}
          </p>
        </div>
      ) : (
        <div className="diary-entries">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                className="diary-entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="entry-header">
                  <div className="entry-date-mood">
                    <span className="entry-mood">{entry.mood}</span>
                    <span className="entry-date">
                      {format(new Date(entry.date), 'EEEE, MMMM do, yyyy')}
                    </span>
                  </div>
                  <div className="entry-actions">
                    <button
                      className="entry-action edit"
                      onClick={() => handleOpenModal(entry)}
                      aria-label="Edit entry"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="entry-action delete"
                      onClick={() => handleDeleteEntry(entry.id)}
                      aria-label="Delete entry"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="entry-content">
                  <p>{entry.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentEntry.id ? 'Edit Diary Entry' : 'New Diary Entry'}
      >
        <form onSubmit={handleSaveEntry} className="diary-form">
          <div className="form-group mood-selector">
            <label>How are you feeling today?</label>
            <div className="mood-options">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  className={`mood-btn ${currentEntry.mood === mood.value ? 'selected' : ''}`}
                  onClick={() => setCurrentEntry({ ...currentEntry, mood: mood.value })}
                  aria-label={mood.label}
                  title={mood.label}
                >
                  {mood.value}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="entry-content">Tell me about your day...</label>
            <textarea
              id="entry-content"
              value={currentEntry.content}
              onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
              placeholder="Write about your day, thoughts, feelings..."
              rows={10}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Diary;
