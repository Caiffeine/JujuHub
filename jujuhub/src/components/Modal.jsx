import * as Dialog from '@radix-ui/react-dialog';
import { IoClose } from 'react-icons/io5';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  className = ''
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Dialog.Content asChild>
                  <motion.div 
                    className={`modal-content ${size} ${className}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.2, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    <div className="modal-header">
                      <Dialog.Title className="modal-title">{title}</Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="modal-close" aria-label="Close">
                          <IoClose />
                        </button>
                      </Dialog.Close>
                    </div>
                    <div className="modal-body">
                      {children}
                    </div>
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default Modal;
