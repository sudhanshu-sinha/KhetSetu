import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import StatsCounter from '../components/ui/StatsCounter';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { FiTrendingUp, FiDollarSign, FiCheckCircle, FiBarChart2, FiPieChart } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CAT_COLORS = ['from-primary-400 to-primary-600', 'from-gold-400 to-gold-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-gray-400 to-gray-600'];

export default function AnalyticsDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const isHi = i18n.language === 'hi';
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build monthly chart data (last 6 months)
  const months = isHi ? MONTHS_HI : MONTHS_EN;
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { monthNum: d.getMonth() + 1, label: months[d.getMonth()] };
  });

  const monthlyMap = {};
  (analytics?.monthlyEarnings || []).forEach(m => { monthlyMap[m.month] = m.amount; });
  const monthlyData = last6Months.map(m => monthlyMap[m.monthNum] || 0);
  const maxMonthly = Math.max(...monthlyData, 1);

  const totalCategories = (analytics?.topCategories || []).reduce((s, c) => s + c.count, 0) || 1;
  const categories = (analytics?.topCategories || []).slice(0, 5).map((c, i) => ({
    name: isHi ? t(`${c.category}Hi`) || t(c.category) : t(c.category) || c.category,
    value: Math.round((c.count / totalCategories) * 100),
    color: CAT_COLORS[i] || CAT_COLORS[4]
  }));

  const stats = [
    { icon: FiDollarSign, label: isHi ? 'कुल आमदनी' : 'Total Earnings', value: analytics?.totalEarnings || 0, prefix: '₹', color: 'from-primary-400 to-emerald-500' },
    { icon: FiCheckCircle, label: isHi ? 'काम पूरे' : 'Jobs Done', value: analytics?.completedJobs || 0, color: 'from-blue-400 to-cyan-500' },
    { icon: FiTrendingUp, label: isHi ? 'सफ़लता दर' : 'Success Rate', value: analytics?.successRate || 0, suffix: '%', color: 'from-gold-400 to-amber-500' },
  ];

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.h1 variants={fadeUp} className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 font-display flex items-center gap-2">
          <FiBarChart2 className="text-primary-500" /> {isHi ? 'एनालिटिक्स' : 'Analytics'}
        </motion.h1>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <>
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
                  {monthlyData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-semibold text-gray-500">
                        {val > 0 ? `₹${(val / 1000).toFixed(0)}K` : '—'}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / maxMonthly) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
                        className={`w-full rounded-xl ${i === monthlyData.length - 1 ? 'chart-bar animate-glow-pulse' : 'chart-bar'}`}
                        style={{ minHeight: val > 0 ? '8px' : '2px', opacity: val > 0 ? 1 : 0.3 }}
                      />
                      <span className="text-[9px] font-medium text-gray-400">{last6Months[i].label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Categories */}
            {categories.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="mb-5">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiPieChart size={14} className="text-gold-500" />
                    {isHi ? 'श्रेणी विभाजन' : 'Top Categories'}
                  </h3>
                  <div className="space-y-2.5">
                    {categories.map((cat, i) => (
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
            )}

            {/* Summary stats */}
            <motion.div variants={fadeUp}>
              <GlassCard>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  📋 {isHi ? 'सारांश' : 'Summary'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: isHi ? 'कुल जॉब्स' : 'Total Jobs', value: analytics?.totalJobs || 0 },
                    { label: isHi ? 'खुले जॉब्स' : 'Open Jobs', value: analytics?.openJobs || 0 },
                    { label: isHi ? 'कुल आवेदन' : 'Total Applications', value: analytics?.totalApplications || 0 },
                    { label: isHi ? 'स्वीकृत' : 'Accepted', value: analytics?.acceptedApplications || 0 },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white font-display">{item.value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
