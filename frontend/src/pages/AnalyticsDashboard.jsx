import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import StatsCounter from '../components/ui/StatsCounter';
import GlassCard from '../components/ui/GlassCard';
import { FiTrendingUp, FiDollarSign, FiCheckCircle, FiBarChart2, FiPieChart } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const isHi = i18n.language === 'hi';

  // Demo analytics data
  const [data] = useState({
    totalEarnings: isFarmer ? 125000 : 45000,
    totalJobs: isFarmer ? 34 : 28,
    successRate: 87,
    avgRating: 4.6,
    monthlyData: [12000, 18000, 8000, 22000, 15000, 28000],
    categories: [
      { name: isHi ? 'कटाई' : 'Harvesting', value: 35, color: 'from-primary-400 to-primary-600' },
      { name: isHi ? 'बुवाई' : 'Sowing', value: 25, color: 'from-gold-400 to-gold-600' },
      { name: isHi ? 'निराई' : 'Weeding', value: 20, color: 'from-blue-400 to-blue-600' },
      { name: isHi ? 'सिंचाई' : 'Irrigation', value: 15, color: 'from-purple-400 to-purple-600' },
      { name: isHi ? 'अन्य' : 'Other', value: 5, color: 'from-gray-400 to-gray-600' },
    ],
    recentActivity: [
      { text: isHi ? 'गेहूं कटाई — ₹2,500' : 'Wheat harvesting — ₹2,500', time: '2h ago', emoji: '🌾' },
      { text: isHi ? 'नई रेटिंग — 5⭐' : 'New rating — 5⭐', time: '5h ago', emoji: '⭐' },
      { text: isHi ? 'भुगतान प्राप्त — ₹1,800' : 'Payment received — ₹1,800', time: '1d ago', emoji: '💰' },
    ],
  });

  const maxMonthly = Math.max(...data.monthlyData);
  const months = isHi ? MONTHS_HI : MONTHS_EN;
  const recentMonths = months.slice(0, 6);

  const stats = [
    { icon: FiDollarSign, label: isHi ? 'कुल आमदनी' : 'Total Earnings', value: data.totalEarnings, prefix: '₹', color: 'from-primary-400 to-emerald-500' },
    { icon: FiCheckCircle, label: isHi ? 'काम पूरे' : 'Jobs Done', value: data.totalJobs, color: 'from-blue-400 to-cyan-500' },
    { icon: FiTrendingUp, label: isHi ? 'सफ़लता दर' : 'Success Rate', value: data.successRate, suffix: '%', color: 'from-gold-400 to-amber-500' },
  ];

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.h1 variants={fadeUp} className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 font-display flex items-center gap-2">
          <FiBarChart2 className="text-primary-500" /> {isHi ? 'एनालिटिक्स' : 'Analytics'}
        </motion.h1>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon bg-gradient-to-br ${s.color}`}>
                <s.icon className="text-white" size={18} />
              </div>
              <StatsCounter end={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} className="stat-value text-xl" duration={1500} />
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Monthly Chart — Pure CSS */}
        <motion.div variants={fadeUp}>
          <GlassCard className="mb-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp size={14} className="text-primary-500" />
              {isHi ? 'मासिक आमदनी' : 'Monthly Earnings'}
            </h3>
            <div className="flex items-end justify-between gap-1.5 h-32">
              {data.monthlyData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-gray-500">₹{(val / 1000).toFixed(0)}K</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxMonthly) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    className={`w-full rounded-xl ${i === data.monthlyData.length - 1 ? 'chart-bar animate-glow-pulse' : 'chart-bar'}`}
                  />
                  <span className="text-[9px] font-medium text-gray-400">{recentMonths[i]}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Categories Donut — CSS */}
        <motion.div variants={fadeUp}>
          <GlassCard className="mb-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiPieChart size={14} className="text-gold-500" />
              {isHi ? 'श्रेणी विभाजन' : 'Top Categories'}
            </h3>
            <div className="space-y-2.5">
              {data.categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="font-semibold text-gray-500">{cat.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ delay: i * 0.12, duration: 0.8, ease: 'easeOut' }}
                      className={`progress-bar-fill bg-gradient-to-r ${cat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <GlassCard>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
              {isHi ? '📋 हाल की गतिविधि' : '📋 Recent Activity'}
            </h3>
            <div className="space-y-3">
              {data.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-2 border-b border-gray-100/50 dark:border-white/5 last:border-0 last:pb-0">
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                    <p className="text-[10px] text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
