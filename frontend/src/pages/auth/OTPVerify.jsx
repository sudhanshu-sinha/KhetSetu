import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function OTPVerify() {
  const { t } = useTranslation();
  const { verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone) { navigate('/login'); return; }
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [phone, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // Auto-submit when all filled
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const data = await verifyOtp(phone, code);
      toast.success('✅ Login successful!');
      if (data.isNewUser || !data.user.role) {
        navigate('/select-role');
      } else if (!data.user.isProfileComplete) {
        navigate('/setup-profile');
      } else {
        navigate(data.user.role === 'farmer' ? '/farmer' : '/worker');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || t('invalidOtp'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone);
      setCountdown(30);
      toast.success(t('otpSent'));
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🔐</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{t('enterOtp')}</h1>
          <p className="text-sm text-gray-500 mt-2">{phone}</p>
        </div>

        <div className="card">
          {/* OTP Input Boxes */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none transition-all"
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleVerify()}
            disabled={otp.join('').length !== 6 || loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              t('verifyOtp')
            )}
          </motion.button>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-xs text-gray-400">{t('resendOtp')} ({countdown}s)</p>
            ) : (
              <button onClick={handleResend} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                {t('resendOtp')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
