import { Routes, Route } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Notes from './pages/Notes/Notes'
import Diary from './pages/Diary/Diary'
import Books from './pages/Books/Books'
import Music from './pages/Music/Music'
import Watchlist from './pages/Watchlist/Watchlist'
import BucketList from './pages/BucketList/BucketList'
import RelationshipCorner from './pages/RelationshipCorner/RelationshipCorner'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="notes" element={<Notes />} />
        <Route path="diary" element={<Diary />} />
        <Route path="books" element={<Books />} />
        <Route path="music" element={<Music />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="bucket-list" element={<BucketList />} />
        <Route path="relationship" element={<RelationshipCorner />} />
      </Route>
    </Routes>
  )
}

export default App
