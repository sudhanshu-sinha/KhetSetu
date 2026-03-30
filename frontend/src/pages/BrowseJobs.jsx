import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { FiSearch, FiX } from 'react-icons/fi';

const categories = ['all', 'sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];
const categoryEmojis = { all: '📋', sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };

export default function BrowseJobs() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [appliedJobStatusMap, setAppliedJobStatusMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  });
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
      const params = { page, limit: 20 };
      if (filter !== 'all') params.category = filter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filter by search text (in case backend doesn't support search param)
  const displayed = search.trim()
    ? jobs.filter(j =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.description?.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.district?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('browseJobs')}</h1>

        {/* Search bar */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('search') || 'Search jobs...'}
            className="input-field pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={14} />
            </button>
          )}
        </div>

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
            {displayed.length === 0 ? (
              <div className="card text-center py-12">
                <span className="text-5xl">🔍</span>
                <p className="text-sm text-gray-500 mt-3">{t('noJobs')}</p>
              </div>
            ) : (
              displayed.map(job => (
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
