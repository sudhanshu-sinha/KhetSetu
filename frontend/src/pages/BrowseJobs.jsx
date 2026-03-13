import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const categories = ['all', 'sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];
const categoryEmojis = { all: '📋', sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };

export default function BrowseJobs() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobStatusMap, setAppliedJobStatusMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchJobs(); }, [filter, page]);

  // Fetch worker's applied jobs on mount
  useEffect(() => {
    if (user?.role === 'worker') {
      api.get('/applications/my').then(({ data }) => {
        const statusMap = new Map(data.applications.map(a => [a.job?._id, a.status]));
        setAppliedJobStatusMap(statusMap);
      }).catch(() => {});
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.category = filter;
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('browseJobs')}</h1>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setFilter(cat); setPage(1); }}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                ${filter === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            >
              <span>{categoryEmojis[cat]}</span> {t(cat)}
            </button>
          ))}
        </div>

        {/* Job list */}
        {loading ? <LoadingSkeleton count={5} /> : (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="card text-center py-12">
                <span className="text-5xl">🔍</span>
                <p className="text-sm text-gray-500 mt-3">{t('noJobs')}</p>
              </div>
            ) : (
              jobs.map(job => (
                <JobCard key={job._id} job={job} onClick={(j) => navigate(`/job/${j._id}`)} showDistance applicationStatus={appliedJobStatusMap.get(job._id)} />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-xs px-4 py-2">← Prev</button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary text-xs px-4 py-2">Next →</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
