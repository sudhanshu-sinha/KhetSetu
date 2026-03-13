import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, gradient = false, onClick }) {
  const base = gradient ? 'card-gradient' : 'card';
  const hoverClass = hover ? 'hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200/50 dark:hover:border-primary-500/20 cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${base} ${hoverClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
