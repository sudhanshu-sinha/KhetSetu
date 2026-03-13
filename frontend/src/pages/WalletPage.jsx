import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import StatsCounter from '../components/ui/StatsCounter';
import { FiArrowUpRight, FiArrowDownLeft, FiPlus, FiCreditCard, FiClock } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function WalletPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState('all');

  // Demo data
  const balance = 12500;
  const transactions = [
    { id: 1, type: 'credit', amount: 2500, desc: isHi ? 'गेहूं कटाई भुगतान' : 'Wheat harvesting payment', time: '2 hrs ago', emoji: '💰' },
    { id: 2, type: 'credit', amount: 1800, desc: isHi ? 'धान रोपाई भुगतान' : 'Paddy planting payment', time: '1 day ago', emoji: '💰' },
    { id: 3, type: 'debit', amount: 500, desc: isHi ? 'प्रीमियम प्लान' : 'Premium plan', time: '3 days ago', emoji: '👑' },
    { id: 4, type: 'credit', amount: 3200, desc: isHi ? 'सिंचाई काम भुगतान' : 'Irrigation work payment', time: '5 days ago', emoji: '💰' },
    { id: 5, type: 'debit', amount: 100, desc: isHi ? 'रेफ़रल बोनस भेजा' : 'Referral bonus sent', time: '1 week ago', emoji: '🎁' },
  ];

  const filtered = activeTab === 'all' ? transactions : transactions.filter(t => t.type === activeTab);

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.h1 variants={fadeUp} className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 font-display">
          💳 {isHi ? 'वॉलेट' : 'Wallet'}
        </motion.h1>

        {/* Balance Card */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 mb-5
          bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-glow-green">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />

          <p className="text-sm font-medium text-white/70 mb-1">{isHi ? 'कुल बैलेंस' : 'Total Balance'}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-white/70">₹</span>
            <StatsCounter end={balance} className="text-4xl text-white font-display" duration={1200} />
          </div>

          <div className="flex gap-3 mt-5">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-semibold hover:bg-white/30 transition-all">
              <FiPlus size={16} /> {isHi ? 'पैसे जोड़ें' : 'Add Money'}
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/20">
              <FiCreditCard size={16} /> {isHi ? 'निकालें' : 'Withdraw'}
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { emoji: '📱', label: isHi ? 'UPI भेजें' : 'Send UPI' },
            { emoji: '🎁', label: isHi ? 'रेफ़रल' : 'Referrals' },
            { emoji: '📊', label: isHi ? 'रिपोर्ट' : 'Reports' },
          ].map((a, i) => (
            <button key={i} className="card text-center py-4 hover:shadow-card-hover transition-shadow">
              <span className="text-2xl">{a.emoji}</span>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mt-1">{a.label}</p>
            </button>
          ))}
        </motion.div>

        {/* Transactions */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <FiClock size={14} className="text-gray-400" /> {isHi ? 'लेन-देन' : 'Transactions'}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: isHi ? 'सभी' : 'All' },
              { key: 'credit', label: isHi ? 'जमा' : 'Credits' },
              { key: 'debit', label: isHi ? 'निकासी' : 'Debits' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-glow-sm'
                    : 'bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/10'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((txn, i) => (
              <motion.div key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  txn.type === 'credit'
                    ? 'bg-primary-100 dark:bg-primary-500/10'
                    : 'bg-red-100 dark:bg-red-500/10'
                }`}>
                  {txn.type === 'credit'
                    ? <FiArrowDownLeft className="text-primary-600 dark:text-primary-400" size={18} />
                    : <FiArrowUpRight className="text-red-600 dark:text-red-400" size={18} />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{txn.desc}</p>
                  <p className="text-[10px] text-gray-400">{txn.time}</p>
                </div>
                <span className={`text-sm font-bold font-display ${
                  txn.type === 'credit' ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'
                }`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
