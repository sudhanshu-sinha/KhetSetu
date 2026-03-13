import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function StatsCounter({ end, prefix = '', suffix = '', duration = 2000, className = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    
    // If we've already started and the end value dynamically changed, re-animate!
    if (started.current && count !== end) {
      animate();
    }
    
    return () => observer.disconnect();
  }, [end]);

  const animate = () => {
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const format = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toLocaleString('en-IN');
  };

  return (
    <motion.span
      ref={ref}
      className={`font-display font-extrabold tabular-nums ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {prefix}{format(count)}{suffix}
    </motion.span>
  );
}
