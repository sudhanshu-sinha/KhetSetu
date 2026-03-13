import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import StatsCounter from '../components/ui/StatsCounter';
import { useRef, useEffect, useCallback } from 'react';
import { FiMapPin, FiMessageCircle, FiDollarSign, FiStar, FiArrowRight, FiSun, FiMoon, FiShield, FiZap } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const handleGetStarted = () => {
    if (isAuthenticated && user?.isProfileComplete) {
      navigate(user.role === 'farmer' ? '/farmer' : '/worker');
    } else {
      navigate('/login');
    }
  };

  const toggleLang = () => {
    const nl = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nl);
    localStorage.setItem('khetsetu-lang', nl);
  };

  // ═══════ Particle Canvas ═══════
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const initParticles = useCallback((canvas) => {
    const particles = [];
    const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      particlesRef.current = initParticles(canvas);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouse);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains('dark');
      const primary = isDark ? 'rgba(16,185,129,' : 'rgba(16,185,129,';
      const gold = isDark ? 'rgba(245,158,11,' : 'rgba(245,158,11,';

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse repel
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x += dx / dist * 1.5;
          p.y += dy / dist * 1.5;
        }

        const color = i % 3 === 0 ? gold : primary;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${primary}${0.08 * (1 - d / 120)})`;
            ctx.stroke();
          }
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
    };
  }, [initParticles]);

  const features = [
    { icon: FiMapPin, title: t('feat1'), desc: i18n.language === 'hi' ? '50km के अंदर काम खोजें' : 'Find work within 50km radius', color: 'from-primary-400 to-emerald-500' },
    { icon: FiMessageCircle, title: t('feat2'), desc: i18n.language === 'hi' ? 'तुरंत बात करें' : 'Instant messaging', color: 'from-blue-400 to-cyan-500' },
    { icon: FiDollarSign, title: t('feat3'), desc: i18n.language === 'hi' ? 'UPI + कैश भुगतान' : 'UPI + Cash payments', color: 'from-gold-400 to-amber-500' },
    { icon: FiShield, title: i18n.language === 'hi' ? 'सुरक्षित' : 'Secure', desc: i18n.language === 'hi' ? 'वेरिफाइड प्रोफाइल' : 'Verified profiles', color: 'from-purple-400 to-violet-500' },
    { icon: FiStar, title: t('feat4'), desc: i18n.language === 'hi' ? 'भरोसेमंद रेटिंग' : 'Trusted ratings', color: 'from-rose-400 to-pink-500' },
    { icon: FiZap, title: i18n.language === 'hi' ? 'AI मिलान' : 'AI Matching', desc: i18n.language === 'hi' ? 'स्मार्ट जॉब मैचिंग' : 'Smart job matching', color: 'from-orange-400 to-red-500' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: i18n.language === 'hi' ? 'किसान' : 'Farmers', emoji: '🌾' },
    { value: 50000, suffix: '+', label: i18n.language === 'hi' ? 'काम पूरे' : 'Jobs Served', emoji: '✅' },
    { value: 250, suffix: '+', label: i18n.language === 'hi' ? 'ज़िले' : 'Districts', emoji: '📍' },
    { value: 4.8, suffix: '★', label: i18n.language === 'hi' ? 'रेटिंग' : 'Rating', emoji: '⭐' },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc'), emoji: '📱', color: 'from-primary-500 to-primary-600' },
    { num: '02', title: t('step2Title'), desc: t('step2Desc'), emoji: '🌾', color: 'from-gold-500 to-gold-600' },
    { num: '03', title: t('step3Title'), desc: t('step3Desc'), emoji: '🤝', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ═══ Particle Background ═══ */}
      <div className="fixed inset-0 bg-gradient-hero dark:bg-gradient-hero-dark -z-10" />
      <canvas ref={canvasRef} className="fixed inset-0 -z-[5] w-full h-full" />

      {/* ═══ Top Bar ═══ */}
      <header className="sticky top-0 z-40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5">
        <div className="max-w-lg mx-auto flex items-center justify-between px-5 h-14">
          <span className="text-lg font-extrabold gradient-text font-display">🌾 {t('appName')}</span>
          <div className="flex gap-1.5">
            <button onClick={toggleLang}
              className="text-[11px] px-3 py-1.5 rounded-xl font-semibold bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 hover:border-primary-300 transition-all">
              {i18n.language === 'en' ? 'हिंदी' : 'EN'}
            </button>
            <button onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 hover:border-primary-300 transition-all">
              {darkMode ? <FiSun size={14} className="text-gold-400" /> : <FiMoon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <motion.section
        className="px-5 pt-12 pb-8 text-center relative"
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* Floating emoji */}
        <motion.div variants={fadeUp} className="text-7xl mb-6 animate-float">🌾</motion.div>

        <motion.h1 variants={fadeUp}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight text-balance font-display">
          {t('heroTitle')}
        </motion.h1>

        <motion.p variants={fadeUp}
          className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          {t('heroSubtitle')}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}
          whileTap={{ scale: 0.96 }}
          onClick={handleGetStarted}
          className="mt-8 btn-primary text-base px-10 py-4 rounded-2xl flex items-center gap-2.5 mx-auto font-display"
        >
          {t('getStarted')} <FiArrowRight size={18} />
        </motion.button>

        {/* Trust line */}
        <motion.p variants={fadeUp} className="mt-5 text-[11px] text-gray-400 dark:text-gray-600 flex items-center justify-center gap-2">
          <FiShield size={12} className="text-primary-500" />
          {i18n.language === 'hi' ? '100% सुरक्षित • कोई शुल्क नहीं' : '100% Secure • Free to Use'}
        </motion.p>
      </motion.section>

      {/* ═══ Stats Counter ═══ */}
      <motion.section className="px-5 pb-8" initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="card-gradient text-center py-4 px-2">
              <span className="text-xl">{s.emoji}</span>
              <div className="mt-1">
                {s.value < 10 ? (
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white font-display">{s.value}{s.suffix}</span>
                ) : (
                  <StatsCounter end={s.value} suffix={s.suffix} className="text-xl text-gray-900 dark:text-white" />
                )}
              </div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ Features ═══ */}
      <motion.section className="px-5 py-8" initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <h2 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-6 font-display">{t('features')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -3 }}
              className="card text-center py-5 group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2.5 shadow-lg group-hover:shadow-glow-green transition-shadow`}>
                <f.icon size={20} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{f.title}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ How It Works ═══ */}
      <motion.section className="px-5 py-8" initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
        <h2 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-6 font-display">{t('howItWorks')}</h2>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="card-gradient flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-2xl">{s.emoji}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">{i18n.language === 'hi' ? `चरण ${s.num}` : `Step ${s.num}`}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="px-5 py-10">
        <div className="card-gradient text-center py-8">
          <span className="text-5xl animate-float inline-block">🚀</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3 font-display">
            {i18n.language === 'hi' ? 'अभी शुरू करें!' : 'Start Now!'}
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-5 max-w-xs mx-auto">
            {i18n.language === 'hi' ? 'हज़ारों किसान और मज़दूर पहले से जुड़ चुके हैं।' : 'Thousands of farmers & workers already connected.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleGetStarted}
            className="btn-gold px-8 py-3 rounded-2xl text-sm font-display"
          >
            {t('getStarted')} ✨
          </motion.button>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="text-center py-8 text-[11px] text-gray-400 border-t border-gray-200/50 dark:border-white/5">
        <p className="font-display font-semibold gradient-text mb-1">🌾 KhetSetu Ultra</p>
        <p>© 2024 खेतसेतु — {t('taglineHi')}</p>
      </footer>
    </div>
  );
}
