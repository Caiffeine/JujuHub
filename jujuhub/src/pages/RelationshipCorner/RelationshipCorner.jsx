import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaHeart } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './RelationshipCorner.css';

// Photo Memory store (embedded for simplicity)
const usePhotoMemoriesStore = create((set) => ({
  memories: JSON.parse(localStorage.getItem('jujuhub-memories')) || [],
  
  addMemory: (title, photoUrl, caption = '', date = null) => {
    const newMemory = {
      id: uuidv4(),
      title,
      photoUrl,
      caption,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    set(state => {
      const updatedMemories = [...state.memories, newMemory];
      localStorage.setItem('jujuhub-memories', JSON.stringify(updatedMemories));
      return { memories: updatedMemories };
    });
  },
  
  updateMemory: (id, updatedData) => {
    set(state => {
      const updatedMemories = state.memories.map(memory => 
        memory.id === id ? { ...memory, ...updatedData } : memory
      );
      localStorage.setItem('jujuhub-memories', JSON.stringify(updatedMemories));
      return { memories: updatedMemories };
    });
  },
  
  deleteMemory: (id) => {
    set(state => {
      const updatedMemories = state.memories.filter(memory => memory.id !== id);
      localStorage.setItem('jujuhub-memories', JSON.stringify(updatedMemories));
      return { memories: updatedMemories };
    });
  },
  
  reorderMemories: (newOrder) => {
    set(() => {
      localStorage.setItem('jujuhub-memories', JSON.stringify(newOrder));
      return { memories: newOrder };
    });
  },
}));

// Sortable Memory Item Component
const SortableMemoryItem = ({ memory, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: memory.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const formattedDate = memory.date 
    ? new Date(memory.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : '';
  
  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      className="memory-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      layout
      {...attributes}
      {...listeners}
    >
      <div className="memory-photo-container">
        {memory.photoUrl ? (
          <img 
            src={memory.photoUrl} 
            alt={memory.title} 
            className="memory-photo" 
          />
        ) : (
          <div className="memory-photo-placeholder">
            <FaHeart className="heart-icon" />
          </div>
        )}
      </div>
      
      <div className="memory-content">
        <h3 className="memory-title">{memory.title}</h3>
        {formattedDate && <p className="memory-date">{formattedDate}</p>}
        {memory.caption && <p className="memory-caption">{memory.caption}</p>}
      </div>
      
      <div className="memory-actions">
        <button
          className="memory-action edit"
          onClick={() => onEdit(memory)}
          aria-label="Edit memory"
        >
          <FaEdit />
        </button>
        <button
          className="memory-action delete"
          onClick={() => onDelete(memory.id)}
          aria-label="Delete memory"
        >
          <FaTrash />
        </button>
      </div>
      
      <div className="memory-frame"></div>
      <div className="floating-hearts">
        <span className="heart heart1">♥</span>
        <span className="heart heart2">♥</span>
        <span className="heart heart3">♥</span>
      </div>
    </motion.div>
  );
};

const RelationshipCorner = () => {
  const { memories, addMemory, updateMemory, deleteMemory, reorderMemories } = usePhotoMemoriesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState({
    id: null,
    title: '',
    photoUrl: '',
    caption: '',
    date: ''
  });
  
  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenModal = (memory = null) => {
    if (memory) {
      setCurrentMemory({
        id: memory.id,
        title: memory.title,
        photoUrl: memory.photoUrl || '',
        caption: memory.caption || '',
        date: memory.date ? new Date(memory.date).toISOString().split('T')[0] : '',
      });
    } else {
      setCurrentMemory({
        id: null,
        title: '',
        photoUrl: '',
        caption: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveMemory = (e) => {
    e.preventDefault();
    
    if (!currentMemory.title.trim()) {
      let timerInterval;
      Swal.fire({
        title: 'Oops!',
        html: 'Please enter a title for your memory.<br><br>Closing in <b></b> ms.',
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
    
    if (currentMemory.id) {
      updateMemory(currentMemory.id, {
        title: currentMemory.title,
        photoUrl: currentMemory.photoUrl,
        caption: currentMemory.caption,
        date: currentMemory.date ? new Date(currentMemory.date).toISOString() : null,
      });
    } else {
      addMemory(
        currentMemory.title,
        currentMemory.photoUrl,
        currentMemory.caption,
        currentMemory.date ? new Date(currentMemory.date).toISOString() : null
      );
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentMemory.id ? 'Memory updated successfully' : 'New memory added!',
      icon: 'success',
      confirmButtonColor: '#f5a8b9',
      timer: 1500,
      showConfirmButton: false,
    });
  };
  
  const handleDeleteMemory = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to recover this memory!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f5a8b9',
      cancelButtonColor: '#b6cae3',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMemory(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your memory has been removed.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = memories.findIndex(item => item.id === active.id);
      const newIndex = memories.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(memories, oldIndex, newIndex);
      reorderMemories(newOrder);
    }
  };
  
  return (
    <div className="relationship-container">
      <div className="relationship-header">
        <h1 className="page-title">Our Memories</h1>
        <Button 
          variant="primary" 
          icon={<FaPlus />} 
          onClick={() => handleOpenModal()}
        >
          Add Memory
        </Button>
      </div>
      
      {memories.length === 0 ? (
        <div className="memories-empty">
          <p>No memories added yet. Start capturing your special moments!</p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="memories-info">
            Drag and drop photos to rearrange them
          </div>
          <SortableContext
            items={memories.map(memory => memory.id)}
            strategy={rectSortingStrategy}
          >
            <div className="memories-grid">
              <AnimatePresence>
                {memories.map(memory => (
                  <SortableMemoryItem
                    key={memory.id}
                    memory={memory}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteMemory}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentMemory.id ? 'Edit Memory' : 'Add New Memory'}
      >
        <form onSubmit={handleSaveMemory} className="memory-form">
          <div className="form-group">
            <label htmlFor="memory-title">Title</label>
            <input
              id="memory-title"
              type="text"
              value={currentMemory.title}
              onChange={(e) => setCurrentMemory({ ...currentMemory, title: e.target.value })}
              placeholder="Enter a title for this memory..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="memory-photo">Photo URL</label>
            <input
              id="memory-photo"
              type="text"
              value={currentMemory.photoUrl}
              onChange={(e) => setCurrentMemory({ ...currentMemory, photoUrl: e.target.value })}
              placeholder="Enter the URL of your photo..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="memory-date">Date</label>
            <input
              id="memory-date"
              type="date"
              value={currentMemory.date}
              onChange={(e) => setCurrentMemory({ ...currentMemory, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="memory-caption">Caption</label>
            <textarea
              id="memory-caption"
              value={currentMemory.caption}
              onChange={(e) => setCurrentMemory({ ...currentMemory, caption: e.target.value })}
              placeholder="Write a caption for this memory..."
              rows={3}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Memory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RelationshipCorner;
