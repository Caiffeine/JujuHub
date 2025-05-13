import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const handleSwalOpen = () => {
  document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('sweetalert-block'));
};
const handleSwalClose = () => {
  document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('sweetalert-block'));
};
// Patch Swal.fire to always call these
import Swal from 'sweetalert2';
const originalSwalFire = Swal.fire;
Swal.fire = function(...args) {
  handleSwalOpen();
  const result = originalSwalFire.apply(this, args);
  if (result && typeof result.then === 'function') {
    result.then(() => handleSwalClose(), handleSwalClose);
    // Auto-close if only an OK button (no cancel, no input, no timer)
    if (
      args[0] &&
      (!args[0].showCancelButton && !args[0].input && !args[0].timer && !args[0].showDenyButton)
    ) {
      result.then(() => {}, () => {}); // ensure promise chain
      setTimeout(() => {
        Swal.close();
      }, 1500); // 1.5s auto-close
    }
  } else {
    handleSwalClose();
  }
  return result;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
