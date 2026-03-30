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
import toast from 'react-hot-toast';
import { FiPlusCircle, FiBriefcase, FiUsers, FiTrendingUp, FiBarChart2, FiCreditCard, FiCheck, FiX, FiClock } from 'react-icons/fi';
import PayoutModal from '../components/PayoutModal';

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function FarmerDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, applications: 0 });
  const [activePayout, setActivePayout] = useState(null);
  const isHi = i18n.language === 'hi';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/user/my-jobs'),
        api.get('/applications/farmer-recent')
      ]);
      const data = jobsRes.data;
      setJobs(data.jobs);
      const activeJobs = data.jobs || [];
      const apps = appsRes.data.applications || [];
      setJobs(activeJobs);
      setRecentApplications(apps);
      
      // We now compute stats on render
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setRecentApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
      toast.error(isHi ? 'स्थिति अपडेट करने में विफल' : 'Failed to update status');
    }
  };

  const handlePayoutComplete = async (payoutData) => {
    try {
      // 1. Mark completed
      await api.put(`/applications/${activePayout._id}/complete`, payoutData);
      
      // 2. Process mock payment record
      await api.post('/payments', {
        jobId: activePayout.job._id,
        toUser: activePayout.worker._id,
        amount: payoutData.amountPaid,
        method: payoutData.paymentMethod,
        upiTransactionId: payoutData.upiTransactionId
      });

      setRecentApplications(prev => prev.map(a => a._id === activePayout._id ? { ...a, status: 'completed' } : a));
      
      // Also update the local jobs state so the "My Jobs" column reflects the completion immediately
      const completedApp = recentApplications.find(a => a._id === activePayout._id);
      if (completedApp && completedApp.job) {
        setJobs(prevJobs => prevJobs.map(j => j._id === completedApp.job._id || j._id === completedApp.job ? { ...j, status: 'completed' } : j));
      }

      toast.success(isHi ? 'काम पूरा हुआ!' : 'Work completed & worker paid!');
      setActivePayout(null);
    } catch (err) {
      console.error(err);
      toast.error(isHi ? 'स्थिति अपडेट करने में विफल' : 'Failed to complete payout');
    }
  };

  const handleVoiceResult = (text) => {
    navigate(`/browse-jobs?q=${encodeURIComponent(text)}`);
  };

  const derivedStats = {
    open: jobs.filter(j => j.status === 'open').length,
    applications: Math.max(jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0), recentApplications.length),
    completed: jobs.filter(j => j.status === 'completed').length
  };

  const statCards = [
    { icon: FiBriefcase, label: t('activeJobs'), value: derivedStats.open, color: 'from-primary-400 to-emerald-500' },
    { icon: FiUsers, label: t('totalApplications'), value: derivedStats.applications, color: 'from-blue-400 to-cyan-500' },
    { icon: FiTrendingUp, label: t('jobsCompleted'), value: derivedStats.completed, color: 'from-gold-400 to-amber-500' },
  ];

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        {/* Header + Voice Search */}
        <motion.div variants={fadeUp} className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">
              🌾 {t('welcome')}, {user?.name?.split(' ')[0] || t('farmer')}!
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{user?.location?.district || ''}</p>
          </div>
          <VoiceSearch onResult={handleVoiceResult} />
        </motion.div>

        {/* Weather */}
        <motion.div variants={fadeUp} className="mb-4">
          <WeatherWidget />
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 mb-5">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon bg-gradient-to-br ${s.color}`}>
                <s.icon className="text-white" size={18} />
              </div>
              <StatsCounter end={s.value} className="stat-value" duration={1200} />
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2.5 mb-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/post-job')}
            className="btn-primary flex items-center justify-center gap-2 text-sm">
            <FiPlusCircle size={16} /> {t('postJob')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/analytics')}
            className="btn-secondary flex items-center justify-center gap-2 text-sm">
            <FiBarChart2 size={16} /> {isHi ? 'एनालिटिक्स' : 'Analytics'}
          </motion.button>
        </motion.div>

        {/* Premium upsell */}
        <motion.div variants={fadeUp} className="mb-5">
          <div className="card-gradient flex items-center gap-3 cursor-pointer" onClick={() => navigate('/premium')}>
            <span className="text-3xl">👑</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {isHi ? 'प्रीमियम में अपग्रेड करें' : 'Upgrade to Premium'}
              </p>
              <p className="text-[11px] text-gray-500">
                {isHi ? 'अनलिमिटेड जॉब पोस्ट + AI मिलान' : 'Unlimited posts + AI matching'}
              </p>
            </div>
            <span className="text-xs font-bold text-gold-600">₹299/mo</span>
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="w-full">
          {/* My Active Jobs — compact list */}
          {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length > 0 && (
            <motion.div variants={fadeUp} className="mb-5">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  📋 {isHi ? 'मेरी जॉब्स' : 'My Jobs'}
                </h2>
                <button onClick={() => navigate('/my-jobs')} className="text-[11px] text-primary-600 font-semibold">
                  {isHi ? 'सभी →' : 'All →'}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').slice(0, 3).map(job => (
                  <div key={job._id} className="card flex items-center gap-3 cursor-pointer py-3" onClick={() => navigate(`/job/${job._id}`)}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <FiBriefcase size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{job.title}</p>
                      <p className="text-[11px] text-gray-500">{job.applicationsCount || 0} {isHi ? 'आवेदन' : 'applicants'} • {job.workersHired}/{job.workersNeeded} {isHi ? 'भर्ती' : 'hired'}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      job.status === 'open' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      job.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {job.status === 'open' ? (isHi ? 'खुला' : 'Open') :
                       job.status === 'in_progress' ? (isHi ? 'जारी' : 'Active') : job.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <motion.div variants={fadeUp} className="mb-6 lg:mb-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {isHi ? 'हाल के आवेदन' : 'Recent Applications'}
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {recentApplications.map(app => (
                  <div key={app._id} onClick={() => navigate(`/job/${app.job?._id}`)} className="card p-4 ring-1 ring-primary-100 dark:ring-primary-900 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          {app.worker?.profilePhoto ? (
                            <img src={app.worker.profilePhoto} alt={app.worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                              {app.worker?.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {app.worker?.name}
                          </h4>
                          <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                            <div className="flex items-center gap-2">
                              {app.worker?.averageRating > 0 && (
                                <span className="flex items-center text-amber-500 font-medium">
                                  ★ {app.worker.averageRating.toFixed(1)}
                                </span>
                              )}
                              <span>•</span>
                              <span>{app.worker?.totalJobsCompleted || 0} {isHi ? 'जॉब्स' : 'jobs'}</span>
                            </div>
                            {app.teamSize > 1 && (
                              <span className="font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-800 self-start">
                                👥 Team of {app.teamSize}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {app.status === 'pending' ? (
                        <span className="badge-yellow text-[10px]">{t('pending')}</span>
                      ) : app.status === 'accepted' ? (
                        <span className="badge-green text-[10px]">{t('accepted')}</span>
                      ) : app.status === 'completed' ? (
                        <span className="badge-green text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">✨ {isHi ? 'पूरा हुआ' : 'Completed'}</span>
                      ) : (
                        <span className="badge-red text-[10px]">{t('rejected')}</span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 mb-3 flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                        <span>{isHi ? 'के लिए आवेदन किया:' : 'Applied for:'} <span className="text-primary-600 dark:text-primary-400 hover:underline">{app.job?.title}</span></span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-normal"><FiClock size={10} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                      </p>
                      {app.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-1 pb-1 border-t border-gray-200 dark:border-gray-700 pt-1.5">
                          "{app.message}"
                        </p>
                      )}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAppStatus(app._id, 'accepted'); }}
                          className="flex-1 btn-primary py-1.5 text-xs flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-glow-green"
                        >
                           <FiCheck size={14} /> {isHi ? 'स्वीकार करें' : 'Accept'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAppStatus(app._id, 'rejected'); }}
                          className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                        >
                           <FiX size={14} /> {isHi ? 'अस्वीकार करें' : 'Reject'}
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActivePayout(app); }}
                          className="w-full btn-primary py-1.5 text-xs flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-glow-sm"
                        >
                           <FiCheck size={14} /> {isHi ? 'पूरा करें और भुगतान करें' : 'Complete & Pay Worker'}
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'completed' && (
                      <div className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                        🌟 {isHi ? 'काम सफलतापूर्वक पूरा हुआ' : 'Work successfully completed'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <PayoutModal
        isOpen={!!activePayout}
        onClose={() => setActivePayout(null)}
        application={activePayout}
        job={activePayout?.job}
        onComplete={handlePayoutComplete}
      />
    </div>
  );
}
