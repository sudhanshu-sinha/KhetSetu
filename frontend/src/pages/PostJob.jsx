import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const categories = ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];
const categoryEmojis = { sowing: '🌱', harvesting: '🌾', weeding: '🌿', hoeing: '⛏️', irrigation: '💧', spraying: '🧴', plowing: '🚜', other: '📦' };
const wageTypes = ['daily', 'hourly', 'acre', 'fixed'];

export default function PostJob() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', wageType: 'daily',
    wageAmount: '', startDate: '', endDate: '', workersNeeded: 1
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...form,
        wageAmount: parseFloat(form.wageAmount) || 0,
        workersNeeded: parseInt(form.workersNeeded) || 1,
        location: {
          coordinates: user?.location?.coordinates || [0, 0],
          district: user?.location?.district || '',
          village: user?.location?.village || '',
          pincode: user?.location?.pincode || '',
          state: user?.location?.state || ''
        }
      });
      toast.success('✅ Job posted!');
      navigate('/farmer');
    } catch (err) {
      const data = err.response?.data;
      if (data?.details?.length) {
        // Show each validation error
        data.details.forEach(d => toast.error(`${d.field}: ${d.message}`));
      } else {
        toast.error(data?.error || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('postJob')}</h1>
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
          ))}
        </div>

        <div className="card">
          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('category')}</h2>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => { updateForm('category', cat); setStep(2); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.category === cat
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                    <span className="text-2xl">{categoryEmojis[cat]}</span>
                    <p className="text-sm font-medium mt-1">{t(cat)}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Job Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1">{t('jobTitle')}</label>
                <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)}
                  className="input-field" placeholder="e.g. गेहूं की कटाई के लिए मज़दूर चाहिए" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('description')}</label>
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
                  className="input-field h-24 resize-none" placeholder="काम का विवरण..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('startDate')}</label>
                  <input type="date" value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('endDate')}</label>
                  <input type="date" value={form.endDate} onChange={e => updateForm('endDate', e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">{t('cancel')}</button>
                <button onClick={() => setStep(3)} disabled={!form.title || !form.description || !form.startDate}
                  className="btn-primary flex-1">Next →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Wage & Post */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Wage & Workers</h2>
              <div>
                <label className="block text-sm font-medium mb-1">{t('wageType')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {wageTypes.map(wt => (
                    <button key={wt} onClick={() => updateForm('wageType', wt)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${form.wageType === wt
                        ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {t(wt)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('wageAmount')} (₹)</label>
                <input type="number" value={form.wageAmount} onChange={e => updateForm('wageAmount', e.target.value)}
                  className="input-field" placeholder="500" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('workersNeeded')}</label>
                <input type="number" value={form.workersNeeded} onChange={e => updateForm('workersNeeded', e.target.value)}
                  className="input-field" min="1" max="50" />
              </div>

              {/* Review */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-1 text-sm">
                <p><span className="text-gray-500">{t('category')}:</span> {categoryEmojis[form.category]} {t(form.category)}</p>
                <p><span className="text-gray-500">Title:</span> {form.title}</p>
                <p><span className="text-gray-500">Wage:</span> ₹{form.wageAmount}/{t(form.wageType)}</p>
                <p><span className="text-gray-500">Workers:</span> {form.workersNeeded}</p>
                <p><span className="text-gray-500">Location:</span> {user?.location?.village}, {user?.location?.district}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                  disabled={loading || !form.wageAmount} className="btn-primary flex-1">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    : `✅ ${t('postJob')}`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
