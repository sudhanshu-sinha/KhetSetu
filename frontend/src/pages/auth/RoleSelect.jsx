import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RoleSelect() {
  const { t } = useTranslation();
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    try {
      await updateProfile({ role });
      toast.success(`${role === 'farmer' ? '🌾' : '👷'} ${t(role)} selected!`);
      navigate('/setup-profile');
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    }
  };

  const roles = [
    {
      key: 'farmer',
      emoji: '🌾',
      gradient: 'from-green-400 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800'
    },
    {
      key: 'worker',
      emoji: '👷',
      gradient: 'from-amber-400 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('selectRole')}</h1>
          <p className="text-sm text-gray-500 mt-2">अपनी भूमिका चुनें</p>
        </div>

        <div className="space-y-4">
          {roles.map((r, i) => (
            <motion.button
              key={r.key}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(r.key)}
              className={`w-full ${r.bg} ${r.border} border-2 rounded-2xl p-6 text-left flex items-center gap-4 transition-all hover:shadow-xl`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{r.emoji}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t(r.key)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(`${r.key}Desc`)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
