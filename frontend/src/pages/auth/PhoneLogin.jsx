import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPhone, FiArrowRight } from 'react-icons/fi';

export default function PhoneLogin() {
  const { t } = useTranslation();
  const { sendOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    if (phone.replace(/\D/g, '').length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(fullPhone);
      toast.success(t('otpSent'));
      navigate('/verify-otp', { state: { phone: fullPhone } });
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🌾</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{t('appName')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('tagline')}</p>
        </div>

        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('login')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('phone')}
              </label>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="input-field flex-1"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={phone.length < 10 || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiPhone size={16} />
                  {t('sendOtp')}
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            {process.env.NODE_ENV === 'development' && 'Dev mode → OTP: 123456'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
