import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiMapPin, FiXCircle } from 'react-icons/fi';

const categoryEmojis = { sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };
const wageLabels = { daily: '/day', hourly: '/hr', acre: '/acre', fixed: '' };

export default function MyApplications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    try {
      const { data } = await api.get('/applications/my');
      setApps(data.applications);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawingId(id);
    try {
      await api.delete(`/applications/${id}`);
      setApps(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setWithdrawingId(null);
    }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="page-container">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('applications')}</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'pending', 'accepted', 'rejected', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {t(s)}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton count={4} /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-10"><span className="text-4xl">📋</span><p className="text-sm text-gray-500 mt-2">{t('noData')}</p></div>
          ) : filtered.map(app => (
            <motion.div key={app._id} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/job/${app.job?._id}`)} className="card-hover">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start flex-1 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
                    <span className="text-lg">{categoryEmojis[app.job?.category] || '📋'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug truncate">{app.job?.title}</h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium">{app.job?.postedBy?.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><FiMapPin size={10} /> {app.job?.location?.district}</span>
                      </div>
                      
                      {app.teamSize > 1 && (
                        <div className="flex flex-col gap-1 items-start mt-0.5">
                          <span className="font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-800 text-[10px]">
                            👥 Team of {app.teamSize}
                          </span>
                          {app.selectedTeamMembers?.length > 0 && (
                             <p className="text-[10px] text-gray-500 max-w-[150px] truncate" title={app.selectedTeamMembers.join(', ')}>
                               👤 {app.selectedTeamMembers.join(', ')}
                             </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Badge & Wage Stack */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-right">
                  <span className={`badge-${app.status === 'accepted' || app.status === 'completed' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'} text-[10px] flex items-center gap-0.5 whitespace-nowrap`}>
                    {app.status === 'pending' ? '🕒 ' + t('pending') : 
                     app.status === 'accepted' ? '✅ ' + t('accepted') : 
                     app.status === 'completed' ? '🌟 ' + t('completed') :
                     '❌ ' + t('rejected')}
                  </span>
                  
                  <div className="flex flex-col items-end mt-1">
                    {app.teamSize > 1 && ['accepted', 'completed'].includes(app.status) && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Total: ₹{(app.job?.wageAmount || 0) * app.teamSize}</span>
                    )}
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                      {app.teamSize > 1 ? <span className="text-[10px] text-gray-500 font-medium mr-1">Share:</span> : ''}₹{app.job?.wageAmount}<span className="text-xs font-normal text-gray-500">{wageLabels[app.job?.wageType]}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Optional Farmer Note Display */}
              {app.farmerNote && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] text-gray-500 italic max-w-full truncate" title={`Note: ${app.farmerNote}`}>Note: {app.farmerNote}</p>
                </div>
              )}

              {/* Withdraw Button */}
              {['pending', 'accepted'].includes(app.status) && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button 
                    disabled={withdrawingId === app._id}
                    onClick={(e) => handleWithdraw(e, app._id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-transparent dark:border-red-500/20"
                  >
                    {withdrawingId === app._id ? (
                       <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent flex-shrink-0 rounded-full animate-spin" />
                    ) : (
                       <FiXCircle size={14} />
                    )}
                    {withdrawingId === app._id ? 'Withdrawing...' : 'Withdraw Application'}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
