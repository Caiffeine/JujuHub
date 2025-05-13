import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaMusic, FaPlay } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useMusicStore from '../../store/musicStore';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './Music.css';

const VIBE_OPTIONS = [
  { value: 'chill', label: 'Chill Vibes' },
  { value: 'upbeat', label: 'Upbeat & Happy' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'focus', label: 'Focus & Study' },
  { value: 'melancholy', label: 'Melancholy' },
  { value: 'nostalgic', label: 'Nostalgic' }
];

const Music = () => {
  const { tracks, addTrack, updateTrack, deleteTrack } = useMusicStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vibeFilter, setVibeFilter] = useState('');
  const [currentTrack, setCurrentTrack] = useState({
    id: null,
    title: '',
    artist: '',
    vibe: 'chill',
    link: ''
  });
  
  // Filter tracks by vibe if filter is applied
  const filteredTracks = vibeFilter
    ? tracks.filter(track => track.vibe === vibeFilter)
    : tracks;
  
  const handleOpenModal = (track = null) => {
    if (track) {
      setCurrentTrack({ ...track });
    } else {
      setCurrentTrack({
        id: null,
        title: '',
        artist: '',
        vibe: 'chill',
        link: ''
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveTrack = (e) => {
    e.preventDefault();
    
    if (!currentTrack.title.trim() || !currentTrack.artist.trim()) {
      Swal.fire({
        title: 'Oops!',
        text: 'Please enter both title and artist',
        icon: 'warning',
        confirmButtonColor: '#f5a8b9',
      });
      return;
    }
    
    if (currentTrack.id) {
      updateTrack(currentTrack.id, {
        title: currentTrack.title,
        artist: currentTrack.artist,
        vibe: currentTrack.vibe,
        link: currentTrack.link
      });
    } else {
      addTrack(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.vibe,
        currentTrack.link
      );
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentTrack.id ? 'Track updated successfully' : 'Track added successfully',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteTrack = (id) => {
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
        deleteTrack(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your track has been removed from the list.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
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
  
  const handleOpenLink = (link) => {
    if (!link) return;
    
    window.open(link, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="music-container">
      <div className="music-header">
        <h1 className="page-title">My Music</h1>
        <div className="music-actions">
          <div className="vibe-filter">
            <FaFilter className="filter-icon" />
            <select
              value={vibeFilter}
              onChange={(e) => setVibeFilter(e.target.value)}
            >
              <option value="">All Vibes</option>
              {VIBE_OPTIONS.map(option => (
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
            Add Track
          </Button>
        </div>
      </div>
      
      {filteredTracks.length === 0 ? (
        <div className="music-empty">
          <p>
            {vibeFilter
              ? `No tracks in the "${VIBE_OPTIONS.find(v => v.value === vibeFilter)?.label}" vibe`
              : "You haven't added any music yet. Add your first track!"}
          </p>
        </div>
      ) : (
        <div className="music-grid">
          <AnimatePresence>
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                className="track-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="track-header">
                  <FaMusic className="track-icon" />
                  <span className={`track-vibe ${track.vibe}`}>
                    {VIBE_OPTIONS.find(v => v.value === track.vibe)?.label}
                  </span>
                </div>
                <div className="track-details">
                  <h3 className="track-title">{track.title}</h3>
                  <p className="track-artist">by {track.artist}</p>
                  
                  {track.link && getYoutubeEmbedUrl(track.link) ? (
                    <div className="track-embed">
                      <iframe
                        src={getYoutubeEmbedUrl(track.link)}
                        title={track.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : track.link ? (
                    <button 
                      className="track-play-btn"
                      onClick={() => handleOpenLink(track.link)}
                    >
                      <FaPlay /> Play on external site
                    </button>
                  ) : null}
                  
                  <div className="track-actions">
                    <button
                      className="track-action edit"
                      onClick={() => handleOpenModal(track)}
                      aria-label="Edit track"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="track-action delete"
                      onClick={() => handleDeleteTrack(track.id)}
                      aria-label="Delete track"
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
        title={currentTrack.id ? 'Edit Track' : 'Add New Track'}
      >
        <form onSubmit={handleSaveTrack} className="track-form">
          <div className="form-group">
            <label htmlFor="track-title">Title</label>
            <input
              id="track-title"
              type="text"
              value={currentTrack.title}
              onChange={(e) => setCurrentTrack({ ...currentTrack, title: e.target.value })}
              placeholder="Enter track title..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="track-artist">Artist</label>
            <input
              id="track-artist"
              type="text"
              value={currentTrack.artist}
              onChange={(e) => setCurrentTrack({ ...currentTrack, artist: e.target.value })}
              placeholder="Enter artist name..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="track-vibe">Vibe</label>
            <select
              id="track-vibe"
              value={currentTrack.vibe}
              onChange={(e) => setCurrentTrack({ ...currentTrack, vibe: e.target.value })}
            >
              {VIBE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="track-link">Link (YouTube, Spotify, etc.)</label>
            <input
              id="track-link"
              type="text"
              value={currentTrack.link}
              onChange={(e) => setCurrentTrack({ ...currentTrack, link: e.target.value })}
              placeholder="Enter link to music..."
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Track
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Music;
