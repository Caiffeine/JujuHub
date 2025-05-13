import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaCheck, FaUndo } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Watchlist.css';

// Watchlist store (embedded for simplicity)
const useWatchlistStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('jujuhub-watchlist')) || [],
  
  addItem: (title, type, imageUrl, trailerUrl, notes = '') => {
    const newItem = {
      id: uuidv4(),
      title,
      type,
      imageUrl,
      trailerUrl,
      notes,
      watched: false,
      addedAt: new Date().toISOString(),
      watchedAt: null,
    };
    
    set(state => {
      const updatedItems = [...state.items, newItem];
      localStorage.setItem('jujuhub-watchlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
  
  updateItem: (id, updatedData) => {
    set(state => {
      const updatedItems = state.items.map(item => {
        if (item.id === id) {
          // If watched status is being updated, set watchedAt
          const watchedAt = 
            (updatedData.watched === true && !item.watched) 
              ? new Date().toISOString() 
              : (updatedData.watched === false ? null : item.watchedAt);
          
          return { 
            ...item, 
            ...updatedData,
            watchedAt
          };
        }
        return item;
      });
      
      localStorage.setItem('jujuhub-watchlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
  
  deleteItem: (id) => {
    set(state => {
      const updatedItems = state.items.filter(item => item.id !== id);
      localStorage.setItem('jujuhub-watchlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
}));

const TYPE_OPTIONS = [
  { value: 'movie', label: 'Movie' },
  { value: 'tvshow', label: 'TV Show' },
  { value: 'anime', label: 'Anime' },
  { value: 'documentary', label: 'Documentary' },
];

const Watchlist = () => {
  const { items, addItem, updateItem, deleteItem } = useWatchlistStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentItem, setCurrentItem] = useState({
    id: null,
    title: '',
    type: 'movie',
    imageUrl: '',
    trailerUrl: '',
    notes: '',
    watched: false
  });
  
  // Filter items
  const filteredItems = items.filter(item => {
    // Filter by watched status
    if (statusFilter === 'watched' && !item.watched) return false;
    if (statusFilter === 'unwatched' && item.watched) return false;
    
    // Filter by type
    if (typeFilter && item.type !== typeFilter) return false;
    
    return true;
  });
  
  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem({ ...item });
    } else {
      setCurrentItem({
        id: null,
        title: '',
        type: 'movie',
        imageUrl: '',
        trailerUrl: '',
        notes: '',
        watched: false
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveItem = (e) => {
    e.preventDefault();
    
    if (!currentItem.title.trim()) {
      Swal.fire({
        title: 'Oops!',
        text: 'Please enter a title',
        icon: 'warning',
        confirmButtonColor: '#f5a8b9',
      });
      return;
    }
    
    if (currentItem.id) {
      updateItem(currentItem.id, {
        title: currentItem.title,
        type: currentItem.type,
        imageUrl: currentItem.imageUrl,
        trailerUrl: currentItem.trailerUrl,
        notes: currentItem.notes,
        watched: currentItem.watched
      });
    } else {
      addItem(
        currentItem.title,
        currentItem.type,
        currentItem.imageUrl,
        currentItem.trailerUrl,
        currentItem.notes
      );
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentItem.id ? 'Item updated successfully' : 'Item added successfully',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteItem = (id) => {
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
        deleteItem(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Item has been removed from your watchlist.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  const toggleWatchedStatus = (id, currentStatus) => {
    updateItem(id, { watched: !currentStatus });
    
    if (!currentStatus) {
      Swal.fire({
        title: 'Watched!',
        text: 'Marked as watched. How was it?',
        icon: 'success',
        confirmButtonColor: '#f5a8b9',
      });
    }
  };
  
  const getYoutubeEmbedUrl = (link) => {
    if (!link) return null;
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return null;
  };
  
  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1 className="page-title">My Watchlist</h1>
        <div className="watchlist-actions">
          <div className="filter-group">
            <div className="status-filter">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="watched">Watched</option>
                <option value="unwatched">Unwatched</option>
              </select>
            </div>
            
            <div className="type-filter">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => handleOpenModal()}
          >
            Add to Watchlist
          </Button>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="watchlist-empty">
          <p>
            {statusFilter !== 'all' || typeFilter
              ? "No items match your filter"
              : "Your watchlist is empty. Add your first movie or show!"}
          </p>
        </div>
      ) : (
        <div className="watchlist-grid">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                className={`watchlist-item ${item.watched ? 'watched' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                  ) : (
                    <div className="item-image-placeholder">
                      <span>{item.title}</span>
                    </div>
                  )}
                  <div className="item-type-badge">
                    {TYPE_OPTIONS.find(t => t.value === item.type)?.label}
                  </div>
                  {item.watched && (
                    <div className="item-watched-badge">
                      <FaCheck /> Watched
                    </div>
                  )}
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  
                  {item.trailerUrl && getYoutubeEmbedUrl(item.trailerUrl) && (
                    <div className="item-trailer">
                      <iframe
                        src={getYoutubeEmbedUrl(item.trailerUrl)}
                        title={`${item.title} trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                  
                  {item.notes && (
                    <p className="item-notes">{item.notes}</p>
                  )}
                  
                  <div className="item-actions">
                    <button
                      className={`watched-toggle ${item.watched ? 'unwatched' : 'watched'}`}
                      onClick={() => toggleWatchedStatus(item.id, item.watched)}
                      aria-label={item.watched ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {item.watched ? (
                        <>
                          <FaUndo /> Mark as unwatched
                        </>
                      ) : (
                        <>
                          <FaCheck /> Mark as watched
                        </>
                      )}
                    </button>
                    
                    <div className="edit-actions">
                      <button
                        className="item-action edit"
                        onClick={() => handleOpenModal(item)}
                        aria-label="Edit item"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="item-action delete"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete item"
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
        title={currentItem.id ? 'Edit Item' : 'Add to Watchlist'}
      >
        <form onSubmit={handleSaveItem} className="watchlist-form">
          <div className="form-group">
            <label htmlFor="item-title">Title</label>
            <input
              id="item-title"
              type="text"
              value={currentItem.title}
              onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              placeholder="Enter title..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-type">Type</label>
            <select
              id="item-type"
              value={currentItem.type}
              onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value })}
            >
              {TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="item-image">Poster Image URL (optional)</label>
            <input
              id="item-image"
              type="text"
              value={currentItem.imageUrl}
              onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
              placeholder="Enter image URL..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-trailer">Trailer URL (YouTube, optional)</label>
            <input
              id="item-trailer"
              type="text"
              value={currentItem.trailerUrl}
              onChange={(e) => setCurrentItem({ ...currentItem, trailerUrl: e.target.value })}
              placeholder="Enter YouTube URL..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-notes">Notes (optional)</label>
            <textarea
              id="item-notes"
              value={currentItem.notes}
              onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
              placeholder="Add your thoughts..."
              rows={4}
            />
          </div>
          {currentItem.id && (
            <div className="form-group watched-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={currentItem.watched}
                  onChange={(e) => setCurrentItem({ ...currentItem, watched: e.target.checked })}
                />
                Watched
              </label>
            </div>
          )}
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

export default Watchlist;
