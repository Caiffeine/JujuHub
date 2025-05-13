import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  icon, 
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <motion.button
      type={type}
      className={`button ${variant} ${size} ${className} ${icon ? 'has-icon' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </motion.button>
  );
};

export default Button;
