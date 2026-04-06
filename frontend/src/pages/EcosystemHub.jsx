import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiTrendingUp, FiSettings, FiShoppingCart, FiCreditCard, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function EcosystemHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      title: "Equipment Rentals",
      desc: "Rent tractors, pumps, and tech locally.",
      icon: <FiShoppingCart size={24} />,
      color: "from-amber-400 to-orange-500",
      action: () => alert('Rentals Page - MOCK')
    },
    {
      title: "Micro-Wage Financing",
      desc: "Get instant advance loans to pay workers.",
      icon: <FiCreditCard size={24} />,
      color: "from-blue-400 to-indigo-500",
      action: () => alert('Loans Page - MOCK')
    },
    {
      title: "Premium Tools",
      desc: "Broadcast jobs, Verified Badges.",
      icon: <FiAward size={24} />,
      color: "from-purple-400 to-violet-500",
      action: () => navigate('/premium')
    },
    {
      title: "Agri Market Trends",
      desc: "Mandi prices and weather alerts.",
      icon: <FiTrendingUp size={24} />,
      color: "from-emerald-400 to-teal-500",
      action: () => navigate('/analytics')
    }
  ];

  return (
    <div className="page-container pb-24">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ecosystem Hub</h1>
        <p className="text-sm text-gray-500 mb-6">Explore the full power of KhetSetu.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={s.action}
              className="card flex flex-col items-start gap-4 hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                {s.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
