import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import WeatherWidget from '../components/ui/WeatherWidget';
import VoiceSearch from '../components/ui/VoiceSearch';
import StatsCounter from '../components/ui/StatsCounter';
import BadgeDisplay, { getBadgesForUser } from '../components/ui/BadgeDisplay';
import { FiSearch, FiCheckCircle, FiDollarSign, FiStar, FiTrendingUp, FiAward, FiCreditCard } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function WorkerDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const isHi = i18n.language === 'hi';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, walletRes] = await Promise.all([
        api.get('/jobs', { params: { limit: 5 } }),
        api.get('/applications/my', { params: { limit: 5 } }),
        api.get('/wallet').catch(() => ({ data: { wallet: { balance: 0 } } }))
      ]);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data.applications);
      setWalletBalance(walletRes.data.wallet?.balance || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const userBadges = getBadgesForUser(user);

  const applicationStatusMap = new Map(applications.map(a => [a.job?._id, a.status]));

  const stats = [
    { icon: FiCheckCircle, label: t('jobsCompleted'), value: user?.totalJobsCompleted || 0, color: 'from-primary-400 to-emerald-500' },
    { icon: FiStar, label: t('rating'), value: user?.averageRating?.toFixed(1) || '0', isDecimal: true, color: 'from-gold-400 to-amber-500' },
    { icon: FiDollarSign, label: t('applications'), value: applications.length, color: 'from-blue-400 to-cyan-500' },
  ];

  const handleVoiceResult = (text) => {
    navigate(`/browse-jobs?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        {/* Header + Voice */}
        <motion.div variants={fadeUp} className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">
              👷 {t('welcome')}, {user?.name?.split(' ')[0] || t('worker')}!
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{user?.location?.district || ''}</p>
          </div>
          <VoiceSearch onResult={handleVoiceResult} />
        </motion.div>

        {/* Badges */}
        {userBadges.length > 0 && (
          <motion.div variants={fadeUp} className="mb-4">
            <BadgeDisplay badges={userBadges} size="sm" />
          </motion.div>
        )}

        {/* Weather */}
        <motion.div variants={fadeUp} className="mb-4">
          <WeatherWidget compact />
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon bg-gradient-to-br ${s.color}`}>
                <s.icon className="text-white" size={18} />
              </div>
              {s.isDecimal ? (
                <span className="stat-value">{s.value}</span>
              ) : (
                <StatsCounter end={parseInt(s.value)} className="stat-value" duration={1200} />
              )}
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2.5 mb-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/browse-jobs')}
            className="btn-primary flex items-center justify-center gap-2 text-sm">
            <FiSearch size={16} /> {t('browseJobs')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/leaderboard')}
            className="btn-secondary flex items-center justify-center gap-2 text-sm">
            <FiAward size={16} /> {isHi ? 'लीडरबोर्ड' : 'Leaderboard'}
          </motion.button>
        </motion.div>

        {/* Earning preview */}
        <motion.div variants={fadeUp} className="card-gradient flex items-center gap-3 mb-5 cursor-pointer" onClick={() => navigate('/wallet')}>
          <span className="text-3xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{isHi ? 'वॉलेट बैलेंस' : 'Wallet Balance'}</p>
            <p className="text-xs text-gray-500">{isHi ? 'टैप करें देखने के लिए' : 'Tap to view'}</p>
          </div>
          <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400 font-display">₹{walletBalance.toLocaleString('en-IN')}</span>
        </motion.div>

        {/* Notifications */}
        {notifications.filter(n => n.type === 'application-update').length > 0 && (
          <motion.div variants={fadeUp} className="mb-4 p-3.5 rounded-2xl bg-primary-50/80 dark:bg-primary-500/10 border border-primary-200/50 dark:border-primary-500/20">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
              🔔 {isHi ? 'आवेदन अपडेट!' : 'Application updates!'}
            </p>
          </motion.div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <motion.div variants={fadeUp} className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('applications')}</h2>
              <button onClick={() => navigate('/my-applications')} className="text-[11px] text-primary-600 font-semibold">{t('all')} →</button>
            </div>
            <div className="space-y-2">
              {applications.slice(0, 3).map(app => (
                <div key={app._id} className="card flex items-center justify-between" onClick={() => navigate(`/job/${app.job?._id}`)}>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app.job?.title}</p>
                    <p className="text-[11px] text-gray-500">{app.job?.postedBy?.name}</p>
                  </div>
                  <span className={`badge-${app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'}`}>
                    {t(app.status)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Nearby Jobs */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('nearbyJobs')}</h2>
          </div>
          {loading ? <LoadingSkeleton count={3} /> : (
            <div className="space-y-2.5">
              {jobs.length === 0 ? (
                <div className="card text-center py-10">
                  <span className="text-5xl animate-float inline-block">🔍</span>
                  <p className="text-sm text-gray-500 mt-3">{t('noJobs')}</p>
                </div>
              ) : (
                jobs.map(job => (
                  <JobCard key={job._id} job={job} onClick={(j) => navigate(`/job/${j._id}`)} applicationStatus={applicationStatusMap.get(job._id)} />
                ))
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
