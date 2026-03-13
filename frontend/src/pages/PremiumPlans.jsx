import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiZap, FiShield, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PremiumPlans() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [selected, setSelected] = useState('gold');

  const plans = [
    {
      id: 'free',
      name: isHi ? 'फ्री' : 'Free',
      price: 0,
      period: isHi ? 'हमेशा' : 'Forever',
      emoji: '🌱',
      gradient: 'from-gray-400 to-gray-500',
      features: [
        isHi ? '5 जॉब पोस्ट/माह' : '5 job posts/month',
        isHi ? 'बेसिक प्रोफ़ाइल' : 'Basic profile',
        isHi ? 'चैट सुविधा' : 'Chat feature',
      ],
      missing: [
        isHi ? 'प्राथमिकता लिस्टिंग' : 'Priority listing',
        isHi ? 'एनालिटिक्स डैशबोर्ड' : 'Analytics dashboard',
        isHi ? 'वेरिफ़ाइड बैज' : 'Verified badge',
      ],
    },
    {
      id: 'silver',
      name: isHi ? 'सिल्वर' : 'Silver',
      price: 99,
      period: isHi ? '/माह' : '/month',
      emoji: '🥈',
      gradient: 'from-gray-300 to-gray-500',
      features: [
        isHi ? '20 जॉब पोस्ट/माह' : '20 job posts/month',
        isHi ? 'प्राथमिकता लिस्टिंग' : 'Priority listing',
        isHi ? 'एनालिटिक्स बेसिक' : 'Basic analytics',
        isHi ? 'चैट + कॉल' : 'Chat + calls',
      ],
      missing: [
        isHi ? 'वेरिफ़ाइड बैज' : 'Verified badge',
        isHi ? 'AI मिलान' : 'AI matching',
      ],
    },
    {
      id: 'gold',
      name: isHi ? 'गोल्ड' : 'Gold',
      price: 299,
      period: isHi ? '/माह' : '/month',
      emoji: '👑',
      gradient: 'from-gold-400 via-gold-500 to-amber-600',
      popular: true,
      features: [
        isHi ? 'अनलिमिटेड जॉब पोस्ट' : 'Unlimited job posts',
        isHi ? 'टॉप प्राथमिकता' : 'Top priority listing',
        isHi ? 'पूरा एनालिटिक्स' : 'Full analytics',
        isHi ? 'वीडियो कॉलिंग' : 'Video calling',
        isHi ? '💎 वेरिफ़ाइड बैज' : '💎 Verified badge',
        isHi ? '🤖 AI स्मार्ट मिलान' : '🤖 AI smart matching',
      ],
      missing: [],
    },
  ];

  const handleSubscribe = (plan) => {
    toast.success(`${plan.emoji} ${plan.name} ${isHi ? 'प्लान चुना!' : 'plan selected!'}`);
    // In production: initiate Razorpay checkout
  };

  return (
    <div className="page-container">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <motion.div variants={fadeUp} className="text-center mb-6">
          <span className="text-4xl">👑</span>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2 font-display">
            {isHi ? 'प्रीमियम प्लान' : 'Premium Plans'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isHi ? 'अपने व्यापार को बढ़ाएं' : 'Boost your business'}
          </p>
        </motion.div>

        <div className="space-y-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} variants={fadeUp}
              onClick={() => setSelected(plan.id)}
              className={`relative rounded-3xl p-5 cursor-pointer transition-all duration-500 ${
                selected === plan.id
                  ? 'card-gradient shadow-card-hover ring-2 ring-primary-400/50 dark:ring-primary-500/30'
                  : 'card'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-gold-400 to-gold-600 text-white text-[10px] font-bold rounded-full shadow-glow-gold uppercase tracking-wider">
                    {isHi ? '⭐ लोकप्रिय' : '⭐ Popular'}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <span className="text-2xl">{plan.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white font-display">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
                      {plan.price === 0 ? (isHi ? 'मुफ़्त' : 'Free') : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-xs text-gray-500">{plan.period}</span>}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 space-y-2">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <FiCheck size={14} className="text-primary-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.missing.map((f, j) => (
                  <div key={`m-${j}`} className="flex items-center gap-2 opacity-40">
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                    <span className="text-xs text-gray-400 line-through">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {selected === plan.id && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
                  className={`mt-4 w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 ${
                    plan.id === 'gold'
                      ? 'btn-gold'
                      : plan.id === 'silver'
                        ? 'btn-primary'
                        : 'btn-secondary'
                  }`}
                >
                  {plan.price === 0
                    ? (isHi ? 'जारी रखें' : 'Continue Free')
                    : (isHi ? 'सब्सक्राइब करें' : 'Subscribe')}
                  <FiArrowRight size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Trust signals */}
        <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><FiShield size={12} className="text-primary-500" /> {isHi ? 'सुरक्षित भुगतान' : 'Secure Payment'}</span>
          <span className="flex items-center gap-1"><FiZap size={12} className="text-gold-500" /> {isHi ? 'कभी भी रद्द करें' : 'Cancel Anytime'}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
