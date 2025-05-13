import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import { Link } from 'react-router-dom';
import useNotesStore from '../../store/notesStore';
import useDiaryStore from '../../store/diaryStore';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState(new Date());
  const { notes } = useNotesStore();
  const { entries } = useDiaryStore();
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Recent items for dashboard
  const recentNotes = notes.slice(0, 3);
  const recentDiaryEntries = entries.slice(0, 2);

  return (
    <div className="dashboard-container">
      <motion.div 
        className="greeting-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="greeting">{greeting}, love 💕</h1>
        <p className="current-date">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
      </motion.div>

      <div className="dashboard-content">
        <div className="dashboard-column">
          <motion.div 
            className="dashboard-card calendar-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="handwritten">My Calendar</h2>
            <Calendar 
              value={date}
              onChange={setDate}
              className="dashboard-calendar"
            />
          </motion.div>

          <motion.div 
            className="dashboard-card quote-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="handwritten">Quote of the Day</h2>
            <blockquote>
              "The future belongs to those who believe in the beauty of their dreams."
              <footer>— Eleanor Roosevelt</footer>
            </blockquote>
          </motion.div>
        </div>

        <div className="dashboard-column">
          <motion.div 
            className="dashboard-card recent-notes-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="card-header">
              <h2 className="handwritten">Recent Notes</h2>
              <Link to="/notes" className="view-all">View All</Link>
            </div>
            
            {recentNotes.length > 0 ? (
              <div className="recent-notes">
                {recentNotes.map(note => (
                  <div key={note.id} className="recent-note-item">
                    <h3>{note.title}</h3>
                    <p>{note.content.substring(0, 80)}...</p>
                    <small>{format(new Date(note.updatedAt), 'MMM do')}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No notes yet. Create your first note!</p>
            )}
          </motion.div>

          <motion.div 
            className="dashboard-card recent-diary-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-header">
              <h2 className="handwritten">Diary Entries</h2>
              <Link to="/diary" className="view-all">View All</Link>
            </div>
            
            {recentDiaryEntries.length > 0 ? (
              <div className="recent-diary">
                {recentDiaryEntries.map(entry => (
                  <div key={entry.id} className="recent-diary-item">
                    <div className="diary-mood">{entry.mood}</div>
                    <p>{entry.content.substring(0, 100)}...</p>
                    <small>{format(new Date(entry.date), 'MMM do')}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No diary entries yet. Start journaling today!</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
