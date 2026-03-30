import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlusCircle } from 'react-icons/fi';

export default function MyJobs() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHi = i18n.language === 'hi';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs/user/my-jobs');
      setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm(isHi ? 'क्या आप इस जॉब को हटाना चाहते हैं?' : 'Are you sure you want to delete this job?')) return;
    setDeletingId(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success(isHi ? 'जॉब हटा दी गई' : 'Job deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  const filterTabs = [
    { key: 'all', label: isHi ? 'सभी' : 'All' },
    { key: 'open', label: isHi ? 'खुले' : 'Open' },
    { key: 'in_progress', label: isHi ? 'जारी' : 'Active' },
    { key: 'completed', label: isHi ? 'पूरे' : 'Completed' },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('myJobs')}</h1>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/post-job')}
          className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
          <FiPlusCircle size={14} /> {isHi ? 'नई जॉब' : 'Post Job'}
        </motion.button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filterTabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filter === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton count={4} /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-10">
              <span className="text-4xl">📋</span>
              <p className="text-sm text-gray-500 mt-2">{t('noJobs')}</p>
              <button onClick={() => navigate('/post-job')} className="btn-primary mt-4 text-sm px-6">
                {isHi ? '+ जॉब पोस्ट करें' : '+ Post a Job'}
              </button>
            </div>
          ) : filtered.map(job => (
            <div key={job._id} className="relative">
              <JobCard job={job} onClick={(j) => navigate(`/job/${j._id}`)} />
              {/* Delete button — only for open jobs */}
              {job.status === 'open' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }}
                  disabled={deletingId === job._id}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors z-10"
                  title={isHi ? 'जॉब हटाएं' : 'Delete job'}
                >
                  {deletingId === job._id
                    ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <FiTrash2 size={14} />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
