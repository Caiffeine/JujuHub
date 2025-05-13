import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaSortAmountDown, FaSort } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './BucketList.css';

// BucketList store (embedded for simplicity)
const useBucketListStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('jujuhub-bucketlist')) || [],
  
  addItem: (title, description = '', priority = 'medium', dueDate = null) => {
    const newItem = {
      id: uuidv4(),
      title,
      description,
      priority,
      dueDate,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    
    set(state => {
      const updatedItems = [...state.items, newItem];
      localStorage.setItem('jujuhub-bucketlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
  
  updateItem: (id, updatedData) => {
    set(state => {
      const updatedItems = state.items.map(item => {
        if (item.id === id) {
          // If completion status is being updated, set completedAt
          const completedAt 
            = (updatedData.completed === true && !item.completed) 
              ? new Date().toISOString() 
              : (updatedData.completed === false ? null : item.completedAt);
          
          return { 
            ...item, 
            ...updatedData,
            completedAt
          };
        }
        return item;
      });
      
      localStorage.setItem('jujuhub-bucketlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
  
  deleteItem: (id) => {
    set(state => {
      const updatedItems = state.items.filter(item => item.id !== id);
      localStorage.setItem('jujuhub-bucketlist', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },
  
  reorderItems: (newItems) => {
    set(() => {
      localStorage.setItem('jujuhub-bucketlist', JSON.stringify(newItems));
      return { items: newItems };
    });
  },
}));

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }
];

const BucketList = () => {
  const { items, addItem, updateItem, deleteItem } = useBucketListStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortType, setSortType] = useState('createdAt');
  const [showCompleted, setShowCompleted] = useState(true);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    completed: false
  });
  
  // Filter and sort items
  const filteredItems = showCompleted
    ? items
    : items.filter(item => !item.completed);
    
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortType === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    } 
    else if (sortType === 'dueDate') {
      // Sort by due date (null dates go to the bottom)
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    else if (sortType === 'completion') {
      // Sort by completion status (incomplete first)
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    }
    // Default sort by created date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem({
        id: item.id,
        title: item.title,
        description: item.description || '',
        priority: item.priority,
        dueDate: item.dueDate || '',
        completed: item.completed
      });
    } else {
      setCurrentItem({
        id: null,
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        completed: false
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
      let timerInterval;
      Swal.fire({
        title: 'Oops!',
        html: 'Please enter a title for your bucket list item.<br><br>Closing in <b></b> ms.',
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
    
    if (currentItem.id) {
      updateItem(currentItem.id, {
        title: currentItem.title,
        description: currentItem.description,
        priority: currentItem.priority,
        dueDate: currentItem.dueDate || null,
        completed: currentItem.completed
      });
    } else {
      addItem(
        currentItem.title,
        currentItem.description,
        currentItem.priority,
        currentItem.dueDate || null
      );
    }
    
    handleCloseModal();
    
    Swal.fire({
      title: 'Success!',
      text: currentItem.id ? 'Item updated successfully' : 'Added to your bucket list!',
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
          text: 'Item has been removed from your bucket list.',
          icon: 'success',
          confirmButtonColor: '#f5a8b9',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };
  
  const toggleCompletionStatus = (id, currentStatus) => {
    updateItem(id, { completed: !currentStatus });
    
    if (!currentStatus) {
      // Show confetti when marking as completed
      Swal.fire({
        title: 'Congratulations!',
        text: 'You achieved another goal! 🎉',
        icon: 'success',
        confirmButtonColor: '#f5a8b9',
        showConfetti: true
      });
    }
  };
  
  return (
    <div className="bucketlist-container">
      <div className="bucketlist-header">
        <h1 className="page-title">My Bucket List</h1>
        <div className="bucketlist-actions">
          <div className="sort-filter-group">
            <div className="sort-dropdown">
              <FaSort className="sort-icon" />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="createdAt">Sort by Date Added</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="completion">Sort by Completion</option>
              </select>
            </div>
            
            <label className="show-completed-toggle">
              <input 
                type="checkbox" 
                checked={showCompleted} 
                onChange={(e) => setShowCompleted(e.target.checked)} 
              />
              Show Completed Items
            </label>
          </div>
          
          <Button 
            variant="primary" 
            icon={<FaPlus />} 
            onClick={() => handleOpenModal()}
          >
            Add Goal
          </Button>
        </div>
      </div>
      
      {sortedItems.length === 0 ? (
        <div className="bucketlist-empty">
          <p>
            {!showCompleted 
              ? "You don't have any pending goals. Add your dreams and aspirations!"
              : "Your bucket list is empty. Start adding goals you want to achieve!"}
          </p>
        </div>
      ) : (
        <div className="bucketlist-items">
          <AnimatePresence>
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                className={`bucket-item ${item.completed ? 'completed' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="item-content">
                  <div className="item-header">
                    <h3 className="item-title">{item.title}</h3>
                    <span className={`priority-badge ${item.priority}`}>
                      {PRIORITY_OPTIONS.find(p => p.value === item.priority)?.label}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  
                  {item.dueDate && (
                    <p className="item-duedate">
                      <strong>Target Date:</strong> {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  {item.completed && (
                    <div className="completion-badge">
                      <FaCheck /> Completed on {new Date(item.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="item-actions">
                  <button
                    className={`complete-toggle ${item.completed ? 'uncomplete' : 'complete'}`}
                    onClick={() => toggleCompletionStatus(item.id, item.completed)}
                    aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {item.completed ? (
                      <>Undo</>
                    ) : (
                      <>Complete</>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentItem.id ? 'Edit Bucket List Item' : 'Add New Goal'}
      >
        <form onSubmit={handleSaveItem} className="bucketlist-form">
          <div className="form-group">
            <label htmlFor="item-title">Goal Title</label>
            <input
              id="item-title"
              type="text"
              value={currentItem.title}
              onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              placeholder="What do you want to achieve?"
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-description">Description (optional)</label>
            <textarea
              id="item-description"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              placeholder="Add more details about your goal..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-priority">Priority</label>
            <select
              id="item-priority"
              value={currentItem.priority}
              onChange={(e) => setCurrentItem({ ...currentItem, priority: e.target.value })}
            >
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="item-duedate">Target Date (optional)</label>
            <input
              id="item-duedate"
              type="date"
              value={currentItem.dueDate}
              onChange={(e) => setCurrentItem({ ...currentItem, dueDate: e.target.value })}
            />
          </div>
          {currentItem.id && (
            <div className="form-group completion-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={currentItem.completed}
                  onChange={(e) => setCurrentItem({ ...currentItem, completed: e.target.checked })}
                />
                Completed
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

export default BucketList;
