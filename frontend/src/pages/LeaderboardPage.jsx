import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BadgeDisplay, { getBadgesForUser } from '../components/ui/BadgeDisplay';
import GlassCard from '../components/ui/GlassCard';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// Demo leaderboard data
const LEADERBOARD = [
  { name: 'राजेश कुमार', role: 'worker', rating: 4.9, jobs: 142, earnings: 85000, district: 'पटना', badges: ['verified', 'topWorker', 'top100'] },
  { name: 'सीता देवी', role: 'worker', rating: 4.8, jobs: 118, earnings: 72000, district: 'लखनऊ', badges: ['verified', 'topWorker', 'top100'] },
  { name: 'महेश यादव', role: 'farmer', rating: 4.7, jobs: 96, earnings: 125000, district: 'जयपुर', badges: ['verified', 'trusted', 'premium'] },
  { name: 'गीता बाई', role: 'worker', rating: 4.7, jobs: 89, earnings: 58000, district: 'भोपाल', badges: ['verified', 'trusted'] },
  { name: 'रामू प्रसाद', role: 'worker', rating: 4.6, jobs: 78, earnings: 48000, district: 'इलाहाबाद', badges: ['trusted'] },
  { name: 'अनिल शर्मा', role: 'farmer', rating: 4.5, jobs: 65, earnings: 95000, district: 'आगरा', badges: ['verified'] },
  { name: 'सुनीता', role: 'worker', rating: 4.5, jobs: 52, earnings: 35000, district: 'वाराणसी', badges: ['newUser'] },
];

const PODIUM_COLORS = [
  'from-gold-400 to-amber-600',     // 🥇
  'from-gray-300 to-gray-500',       // 🥈
  'from-orange-400 to-orange-600',   // 🥉
];
const PODIUM_SIZES = ['w-20 h-20', 'w-16 h-16', 'w-16 h-16'];
const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.h1 variants={fadeUp} className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 font-display text-center">
          🏆 {isHi ? 'लीडरबोर्ड' : 'Leaderboard'}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-center text-xs text-gray-500 mb-6">
          {isHi ? 'इस महीने के टॉप कर्मचारी और किसान' : 'Top workers & farmers this month'}
        </motion.p>

        {/* Podium */}
        <motion.div variants={fadeUp} className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd place */}
          <div className="text-center flex flex-col items-center">
            <div className={`${PODIUM_SIZES[1]} rounded-full bg-gradient-to-br ${PODIUM_COLORS[1]} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-3 ring-white/50`}>
              {top3[1]?.name?.charAt(0)}
            </div>
            <span className="text-lg mt-1">{PODIUM_MEDALS[1]}</span>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{top3[1]?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-gray-400">⭐ {top3[1]?.rating}</p>
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
            <p className="text-xs text-gold-600 font-semibold">⭐ {top3[0]?.rating} • {top3[0]?.jobs} {isHi ? 'काम' : 'jobs'}</p>
            <div className="w-20 h-24 bg-gradient-to-t from-gold-400 to-gold-500 dark:from-gold-700 dark:to-gold-600 rounded-t-xl mt-2 shadow-glow-gold" />
          </div>

          {/* 3rd place */}
          <div className="text-center flex flex-col items-center">
            <div className={`${PODIUM_SIZES[2]} rounded-full bg-gradient-to-br ${PODIUM_COLORS[2]} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-3 ring-white/50`}>
              {top3[2]?.name?.charAt(0)}
            </div>
            <span className="text-lg mt-1">{PODIUM_MEDALS[2]}</span>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{top3[2]?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-gray-400">⭐ {top3[2]?.rating}</p>
            <div className="w-16 h-12 bg-gradient-to-t from-orange-400 to-orange-500 dark:from-orange-700 dark:to-orange-600 rounded-t-xl mt-2" />
          </div>
        </motion.div>

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {rest.map((user, i) => (
            <motion.div key={i} variants={fadeUp} className="card flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-6 text-center">#{i + 4}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                    {user.role === 'farmer' ? '🌾' : '👷'} {user.district}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gold-600 font-semibold">⭐ {user.rating}</span>
                  <span className="text-[11px] text-gray-400">{user.jobs} {isHi ? 'काम' : 'jobs'}</span>
                  <BadgeDisplay badges={user.badges} size="xs" showLabel={false} />
                </div>
              </div>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400 font-display">
                ₹{(user.earnings / 1000).toFixed(0)}K
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
