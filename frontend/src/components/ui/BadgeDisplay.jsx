import { motion } from 'framer-motion';

const BADGES = {
  verified:   { emoji: '💎', label: 'Verified',      bg: 'from-blue-400 to-indigo-500' },
  topWorker:  { emoji: '⭐', label: 'Top Worker',    bg: 'from-gold-400 to-gold-600' },
  top100:     { emoji: '🏆', label: '100+ Jobs',     bg: 'from-amber-400 to-orange-500' },
  streak:     { emoji: '🔥', label: '7-Day Streak',  bg: 'from-red-400 to-rose-500' },
  fastReply:  { emoji: '⚡', label: 'Fast Reply',    bg: 'from-yellow-400 to-amber-500' },
  trusted:    { emoji: '🛡️', label: 'Trusted',       bg: 'from-primary-400 to-primary-600' },
  newUser:    { emoji: '🌱', label: 'New Member',     bg: 'from-green-400 to-emerald-500' },
  premium:    { emoji: '👑', label: 'Premium',        bg: 'from-purple-400 to-violet-500' },
};

export function getBadgesForUser(user) {
  const badges = [];
  if (user?.isVerified) badges.push('verified');
  if (user?.averageRating >= 4.5) badges.push('topWorker');
  if (user?.totalJobsCompleted >= 100) badges.push('top100');
  if (user?.isPremium) badges.push('premium');
  if (user?.totalJobsCompleted >= 1 && user?.totalJobsCompleted < 10) badges.push('newUser');
  if (user?.totalJobsCompleted >= 10) badges.push('trusted');
  return badges;
}

export default function BadgeDisplay({ badges = [], size = 'sm', showLabel = true }) {
  if (!badges.length) return null;

  const sizeMap = {
    xs: { box: 'w-6 h-6', text: 'text-xs', label: 'text-[9px]' },
    sm: { box: 'w-8 h-8', text: 'text-sm', label: 'text-[10px]' },
    md: { box: 'w-10 h-10', text: 'text-base', label: 'text-xs' },
    lg: { box: 'w-14 h-14', text: 'text-xl', label: 'text-sm' },
  };
  const s = sizeMap[size];

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((key, i) => {
        const b = BADGES[key];
        if (!b) return null;
        return (
          <motion.div
            key={key}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
            className="group relative flex flex-col items-center"
          >
            <div className={`${s.box} rounded-xl bg-gradient-to-br ${b.bg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <span className={s.text}>{b.emoji}</span>
            </div>
            {showLabel && (
              <span className={`${s.label} font-medium text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap`}>
                {b.label}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
