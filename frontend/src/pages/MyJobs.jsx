import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function MyJobs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await api.get('/jobs/user/my-jobs'); setJobs(data.jobs); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="page-container">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('myJobs')}</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {t(s === 'in_progress' ? 'accepted' : s)}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton count={4} /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-10">
              <span className="text-4xl">📋</span>
              <p className="text-sm text-gray-500 mt-2">{t('noJobs')}</p>
            </div>
          ) : filtered.map(job => (
            <JobCard key={job._id} job={job} onClick={(j) => navigate(`/job/${j._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
