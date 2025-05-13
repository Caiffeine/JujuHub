import { NavLink } from 'react-router-dom'
import { FaHome, FaBook, FaMusic, FaHeart, FaListAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { MdNotes, MdMovie } from 'react-icons/md'
import { BsJournalRichtext } from 'react-icons/bs'
import './Sidebar.css'

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const sidebarVariants = {
    expanded: { width: 'var(--sidebar-width)' },
    collapsed: { width: 'var(--sidebar-collapsed-width)' }
  }

  const linkTextVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { duration: 0.2 } }
  }

  return (
    <motion.aside
      className="sidebar"
      initial="expanded"
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      data-state={collapsed ? 'collapsed' : 'expanded'}
    >
      <div className="sidebar-header">
        <motion.h1
          className="sidebar-title"
          variants={linkTextVariants}
        >
          JujuHub
        </motion.h1>
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <FaHeart className={`heart-icon ${collapsed ? 'collapsed' : ''}`} style={{color: '#ffb3c0'}} />
        </button>
      </div>      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink to="/" className="nav-link" end>
            <FaHome className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Dashboard</motion.span>
          </NavLink>
          
          <NavLink to="/notes" className="nav-link">
            <MdNotes className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Notes</motion.span>
          </NavLink>
          
          <NavLink to="/diary" className="nav-link">
            <BsJournalRichtext className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Diary</motion.span>
          </NavLink>
          
          <NavLink to="/books" className="nav-link">
            <FaBook className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Books</motion.span>
          </NavLink>
          
          <NavLink to="/music" className="nav-link">
            <FaMusic className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Music</motion.span>
          </NavLink>
          
          <NavLink to="/watchlist" className="nav-link">
            <MdMovie className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Watchlist</motion.span>
          </NavLink>
          
          <NavLink to="/bucket-list" className="nav-link">
            <FaListAlt className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Bucket List</motion.span>
          </NavLink>
          
          <NavLink to="/relationship" className="nav-link">
            <FaHeart className="nav-icon" />
            <motion.span className="nav-text" variants={linkTextVariants}>Relationship</motion.span>
          </NavLink>
        </nav>
      </div>
    </motion.aside>
  )
}

export default Sidebar
