import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../utils/api';
import BadgeDisplay, { getBadgesForUser } from '../components/ui/BadgeDisplay';
import LoadingSkeleton from '../components/LoadingSkeleton';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const PODIUM_COLORS = [
  'from-gold-400 to-amber-600',
  'from-gray-300 to-gray-500',
  'from-orange-400 to-orange-600',
];
const PODIUM_SIZES = ['w-20 h-20', 'w-16 h-16', 'w-16 h-16'];
const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('worker');

  useEffect(() => { fetchLeaderboard(); }, [roleFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/analytics/leaderboard', { params: { role: roleFilter, limit: 20 } });
      setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.h1 variants={fadeUp} className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 font-display text-center">
          🏆 {isHi ? 'लीडरबोर्ड' : 'Leaderboard'}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-center text-xs text-gray-500 mb-4">
          {isHi ? 'टॉप कर्मचारी और किसान' : 'Top workers & farmers'}
        </motion.p>

        {/* Role Filter */}
        <motion.div variants={fadeUp} className="flex gap-2 justify-center mb-6">
          {['worker', 'farmer'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === r ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {r === 'worker' ? (isHi ? '👷 कर्मचारी' : '👷 Workers') : (isHi ? '🌾 किसान' : '🌾 Farmers')}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <LoadingSkeleton count={5} />
        ) : leaderboard.length === 0 ? (
          <div className="card text-center py-10">
            <span className="text-5xl">🔍</span>
            <p className="text-sm text-gray-500 mt-3">{isHi ? 'कोई डेटा नहीं' : 'No data yet'}</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <motion.div variants={fadeUp} className="flex items-end justify-center gap-3 mb-8">
                {/* 2nd place */}
                <div className="text-center flex flex-col items-center">
                  <div className={`${PODIUM_SIZES[1]} rounded-full bg-gradient-to-br ${PODIUM_COLORS[1]} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-3 ring-white/50`}>
                    {top3[1]?.name?.charAt(0)}
                  </div>
                  <span className="text-lg mt-1">{PODIUM_MEDALS[1]}</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{top3[1]?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400">⭐ {top3[1]?.rating?.toFixed(1) || '0'}</p>
                  <div className="w-16 h-16 bg-gradient-to-t from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-t-xl mt-2" />
                </div>

                {/* 1st place */}
                <div className="text-center flex flex-col items-center -mb-0">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`${PODIUM_SIZES[0]} rounded-full bg-gradient-to-br ${PODIUM_COLORS[0]} flex items-center justify-center text-white text-2xl font-bold shadow-glow-gold ring-4 ring-gold-200/50`}
                  >
                    {top3[0]?.name?.charAt(0)}
                  </motion.div>
                  <span className="text-2xl mt-1">{PODIUM_MEDALS[0]}</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{top3[0]?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-gold-600 font-semibold">⭐ {top3[0]?.rating?.toFixed(1) || '0'} • {top3[0]?.jobsCompleted || 0} {isHi ? 'काम' : 'jobs'}</p>
                  <div className="w-20 h-24 bg-gradient-to-t from-gold-400 to-gold-500 dark:from-gold-700 dark:to-gold-600 rounded-t-xl mt-2 shadow-glow-gold" />
                </div>

                {/* 3rd place */}
                <div className="text-center flex flex-col items-center">
                  <div className={`${PODIUM_SIZES[2]} rounded-full bg-gradient-to-br ${PODIUM_COLORS[2]} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-3 ring-white/50`}>
                    {top3[2]?.name?.charAt(0)}
                  </div>
                  <span className="text-lg mt-1">{PODIUM_MEDALS[2]}</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{top3[2]?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400">⭐ {top3[2]?.rating?.toFixed(1) || '0'}</p>
                  <div className="w-16 h-12 bg-gradient-to-t from-orange-400 to-orange-500 dark:from-orange-700 dark:to-orange-600 rounded-t-xl mt-2" />
                </div>
              </motion.div>
            )}

            {/* Rest of leaderboard */}
            <div className="space-y-2">
              {rest.map((u, i) => (
                <motion.div key={u._id || i} variants={fadeUp} className="card flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6 text-center">#{i + 4}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                      {u.district && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex-shrink-0">
                          {u.district}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gold-600 font-semibold">⭐ {u.rating?.toFixed(1) || '0'}</span>
                      <span className="text-[11px] text-gray-400">{u.jobsCompleted} {isHi ? 'काम' : 'jobs'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
