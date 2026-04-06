import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiCalendar, FiUsers, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const categoryEmojis = { sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };
const wageLabels = { daily: '/day', hourly: '/hr', acre: '/acre', fixed: '' };

export default function JobCard({ job, onClick, showDistance = false, applicationStatus = null }) {
  const { t } = useTranslation();

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `🚜 *New Job on KhetSetu*\n*${job.title}*\n💰 Wage: ₹${job.wageAmount}${wageLabels[job.wageType]}\n📍 Location: ${job.location?.village || job.location?.district}\n🗓️ Starts: ${formatDate(job.startDate)}\n\n*Apply here:* 🔗 https://khetsetu.app/job/${job._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(job)}
      className={`card-hover group ${applicationStatus ? 'ring-1 ring-primary-300 dark:ring-primary-700' : ''}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Category icon with gradient */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow-sm flex-shrink-0 group-hover:shadow-glow-green transition-shadow">
          <span className="text-xl">{categoryEmojis[job.category] || '📋'}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate leading-snug">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {applicationStatus ? (
                <span className={`badge-${applicationStatus === 'accepted' || applicationStatus === 'completed' ? 'green' : applicationStatus === 'rejected' ? 'red' : 'yellow'} text-[10px] flex items-center gap-0.5`}>
                  {applicationStatus === 'pending' ? '🕒 ' + t('pending') : 
                   applicationStatus === 'accepted' ? '✅ ' + t('accepted') : 
                   applicationStatus === 'completed' ? '🌟 ' + t('completed') :
                   '❌ ' + t('rejected')}
                </span>
              ) : (
                <span className={`badge-${job.status === 'open' ? 'green' : job.status === 'completed' ? 'blue' : 'yellow'}`}>
                  {t(job.status)}
                </span>
              )}
            </div>
          </div>

          {/* Wage highlight */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 font-display">
              ₹{job.wageAmount}{wageLabels[job.wageType]}
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <FiUsers size={11} />
              {job.workersHired || 0}/{job.workersNeeded}
            </span>
          </div>

          {/* Meta row & Share */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiMapPin size={11} className="text-red-400" />
                {job.location?.village || job.location?.district || '—'}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiCalendar size={11} className="text-gold-500" />
                {formatDate(job.startDate)}
              </span>
              {showDistance && job.distance && (
                <span className="text-[11px] text-primary-500 font-medium">
                  📍 {job.distance.toFixed(1)} km
                </span>
              )}
            </div>
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-100 transition-colors"
              title="Share to WhatsApp"
            >
              <FaWhatsapp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Gradient bottom accent on hover */}
      <div className="h-0.5 mt-3 -mx-5 -mb-5 rounded-b-3xl bg-gradient-to-r from-primary-400 via-gold-400 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
