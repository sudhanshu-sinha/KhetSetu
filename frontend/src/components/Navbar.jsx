import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiHome, FiSearch, FiMessageSquare, FiUser, FiPlusCircle, FiSun, FiMoon, FiBriefcase, FiBarChart2 } from 'react-icons/fi';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const unreadMessages = notifications.filter(n => n.type === 'message').length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const nl = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nl);
    localStorage.setItem('khetsetu-lang', nl);
  };

  const isFarmer = user?.role === 'farmer';

  const navItems = isFarmer ? [
    { path: '/farmer', icon: FiHome, label: t('home') },
    { path: '/my-jobs', icon: FiBriefcase, label: t('myJobs') },
    { path: '/analytics', icon: FiBarChart2, label: t('analytics') },
    { path: '/chats', icon: FiMessageSquare, label: t('chat'), badge: unreadMessages },
    { path: '/profile', icon: FiUser, label: t('profile') },
  ] : [
    { path: '/worker', icon: FiHome, label: t('home') },
    { path: '/browse-jobs', icon: FiSearch, label: t('jobs') },
    { path: '/my-applications', icon: FiBriefcase, label: t('applications') },
    { path: '/chats', icon: FiMessageSquare, label: t('chat'), badge: unreadMessages },
    { path: '/profile', icon: FiUser, label: t('profile') },
  ];

  // Hide on auth/landing pages
  if (['/', '/login', '/verify-otp', '/select-role', '/setup-profile'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Top bar — glass + scroll shrink */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-lg shadow-gray-200/20 dark:shadow-black/20 border-b border-gray-200/30 dark:border-white/5'
            : 'bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className={`max-w-lg mx-auto px-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-12' : 'h-14'}`}>
          <h1 className={`font-extrabold gradient-text font-display transition-all duration-500 ${scrolled ? 'text-base' : 'text-lg'}`}>
            🌾 {t('appName')}
          </h1>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleLang}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all">
              {i18n.language === 'en' ? 'हिंदी' : 'EN'}
            </button>
            <button onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 hover:border-primary-300 transition-all">
              {darkMode ? <FiSun size={14} className="text-gold-400" /> : <FiMoon size={14} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Bottom nav — glass + animated indicator */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-t border-gray-200/30 dark:border-white/5 shadow-[0_-4px_30px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-lg mx-auto flex justify-around py-1.5 px-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 relative
                ${isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-500/10 rounded-2xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon size={19} className="relative z-10" />
                  <span className="text-[9px] font-semibold relative z-10">{item.label}</span>
                  {item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center z-20 shadow-lg"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Safe area for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
