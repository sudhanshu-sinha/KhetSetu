import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiMessageSquare, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import PayoutModal from '../components/PayoutModal';

const categoryEmojis = { sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };
const wageLabels = { daily: '/day', hourly: '/hour', acre: '/acre', fixed: '' };

export default function JobDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  
  // Payout details
  const [activePayout, setActivePayout] = useState(null);

  const isFarmer = user?.role === 'farmer';
  const isOwner = job?.postedBy?._id === user?._id;

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.job);

      if (isFarmer && data.job.postedBy._id === user._id) {
        const appsRes = await api.get(`/applications/job/${id}`);
        setApplications(appsRes.data.applications);
      }

      if (!isFarmer) {
        try {
          const myApps = await api.get('/applications/my');
          const myApp = myApps.data.applications.find(a => a.job?._id === id);
          if (myApp) setApplication(myApp);
        } catch {} // eslint-disable-line
      }
    } catch (err) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await api.post('/applications', { jobId: id, message: applyMessage });
      toast.success('✅ Applied!');
      setApplication(res.data.application);
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setApplying(false);
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(status === 'accepted' ? '✅ Worker accepted!' : '❌ Application rejected');
      fetchJob();
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handlePayoutComplete = async (payoutData) => {
    try {
      // 1. Mark application complete and create payment
      await api.put(`/applications/${activePayout._id}/complete`, payoutData);
      
      // 2. Create rating record
      if (payoutData.rating) {
        await api.post('/ratings', {
          toUser: activePayout.worker._id,
          jobId: id,
          score: payoutData.rating,
          review: payoutData.review
        });
      }
      
      toast.success('Worker successfully paid and rated! ✨');
      setActivePayout(null);
      fetchJob(); // refresh stats and statuses
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process payout');
    }
  };

  const startChat = async (userId) => {
    try {
      const { data } = await api.post('/chat/start', { userId, jobId: id });
      navigate(`/chats/${data.chat._id}`);
    } catch { toast.error(t('error')); }
  };

  if (loading) return <div className="page-container"><LoadingSkeleton count={1} /><LoadingSkeleton type="profile" /></div>;
  if (!job) return <div className="page-container text-center py-12"><p>Job not found</p></div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Job Header */}
        <div className="card mb-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{categoryEmojis[job.category]}</span>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h1>
              <span className="badge-green mt-1">{t(job.category)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <FiDollarSign className="text-primary-500" />
              <span className="font-bold text-primary-600">₹{job.wageAmount}{wageLabels[job.wageType]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiUsers className="text-blue-500" />
              <span>{job.workersHired}/{job.workersNeeded} {t('workersNeeded').toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-amber-500" />
              <span>{formatDate(job.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="text-red-500" />
              <span>{job.location?.village}, {job.location?.district}</span>
            </div>
          </div>
        </div>

        {/* Farmer Info */}
        <div className="card mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-lg font-bold">
            {job.postedBy?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.postedBy?.name}</p>
            <p className="text-xs text-gray-500">⭐ {job.postedBy?.averageRating?.toFixed(1) || 'New'} • {job.postedBy?.phone}</p>
          </div>
          {!isOwner && (
            <button onClick={() => startChat(job.postedBy._id)} className="btn-secondary text-xs px-3 py-2">
              <FiMessageSquare size={14} />
            </button>
          )}
        </div>

        {/* Worker: Apply */}
        {!isFarmer && !isOwner && (
          <div className="card mb-4">
            {application ? (
              <div className="text-center py-4">
                <span className="text-3xl">
                  {application.status === 'pending' ? '🕒' : 
                   application.status === 'accepted' ? '✅' :
                   application.status === 'completed' ? '🌟' : '❌'}
                </span>
                <p className={`font-medium mt-2 ${
                  application.status === 'accepted' || application.status === 'completed' ? 'text-green-600' :
                  application.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {application.status === 'pending' ? t('pending') :
                   application.status === 'accepted' ? t('accepted') :
                   application.status === 'completed' ? t('completed') : t('rejected')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {application.status === 'pending' ? 'Your application is waiting for farmer review.' :
                   application.status === 'accepted' ? 'Your application was accepted by the farmer!' :
                   application.status === 'completed' ? 'This job has been marked as completed.' : 'Your application was not selected.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)}
                  className="input-field h-20 resize-none" placeholder="Write a message to the farmer (optional)..." />
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleApply} disabled={applying}
                  className="btn-primary w-full">
                  {applying ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    : `${t('apply')} ✅`}
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Farmer: Applications */}
        {isOwner && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t('applicants')} ({applications.length})
              </h2>
              {/* Show Job Completion Progress if any workers are accepted/completed */}
              {applications.some(a => ['accepted', 'completed'].includes(a.status)) && (
                <div className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-800">
                  {applications.filter(a => a.status === 'completed').length} / {job.workersNeeded} Workers Completed
                </div>
              )}
            </div>
            
            {applications.length === 0 ? (
              <div className="card text-center py-8">
                <span className="text-3xl">📭</span>
                <p className="text-sm text-gray-500 mt-2">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app._id} className="card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {app.worker?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{app.worker?.name}</p>
                        <p className="text-xs text-gray-500">
                          ⭐ {app.worker?.averageRating?.toFixed(1) || 'New'} • {app.worker?.totalJobsCompleted || 0} jobs
                        </p>
                      </div>
                      <span className={`badge-${app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'}`}>
                        {t(app.status)}
                      </span>
                    </div>
                    {app.worker?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {app.worker.skills.map(s => (
                          <span key={s} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{t(s)}</span>
                        ))}
                      </div>
                    )}
                    {app.message && <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">"{app.message}"</p>}
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAppStatus(app._id, 'accepted')}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-500 text-white rounded-xl text-xs font-medium">
                          <FiCheck size={14} /> {t('accept')}
                        </button>
                        <button onClick={() => handleAppStatus(app._id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 text-white rounded-xl text-xs font-medium">
                          <FiX size={14} /> {t('reject')}
                        </button>
                        <button onClick={() => startChat(app.worker._id)}
                          className="py-2 px-3 bg-blue-500 text-white rounded-xl">
                          <FiMessageSquare size={14} />
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button onClick={() => setActivePayout(app)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold shadow-glow-green">
                          <FiDollarSign size={16} /> Settle Work & Complete
                        </button>
                        <button onClick={() => startChat(app.worker._id)}
                          className="py-2 px-3 bg-blue-50 text-blue-600 rounded-xl">
                          <FiMessageSquare size={16} />
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'completed' && (
                       <div className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                          <FiCheckCircle size={14} /> Work Settled (Paid: ₹{app.amountPaid || '0'})
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Payout Modal Overlay */}
      <PayoutModal
        isOpen={!!activePayout}
        onClose={() => setActivePayout(null)}
        worker={activePayout?.worker}
        job={job}
        onComplete={handlePayoutComplete}
      />
    </div>
  );
}
