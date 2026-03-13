import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMapPin } from 'react-icons/fi';

const allSkills = ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    district: user?.location?.district || '',
    village: user?.location?.village || '',
    pincode: user?.location?.pincode || '',
    state: user?.location?.state || '',
    skills: user?.skills || []
  });
  const [loading, setLoading] = useState(false);

  const handleSkillToggle = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success('📍 Location detected!');
        // We'll store coords and update via API
        handleSave([pos.coords.longitude, pos.coords.latitude]);
      },
      () => toast.error('Location access denied')
    );
  };

  const handleSave = async (coordinates) => {
    if (!form.name || !form.district) {
      toast.error('Name and district are required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: form.name,
        location: {
          coordinates: coordinates || [0, 0],
          district: form.district,
          village: form.village,
          pincode: form.pincode,
          state: form.state
        },
        skills: user?.role === 'worker' ? form.skills : undefined
      });
      toast.success('✅ Profile saved!');
      navigate(user.role === 'farmer' ? '/farmer' : '/worker');
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-5 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <span className="text-4xl">{user?.role === 'farmer' ? '🌾' : '👷'}</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{t('setupProfile')}</h1>
        </div>

        <div className="card space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field" placeholder="राजेश कुमार" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('district')}</label>
              <input type="text" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                className="input-field" placeholder="ज़िला" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('village')}</label>
              <input type="text" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))}
                className="input-field" placeholder="गाँव" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pincode')}</label>
              <input type="text" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                className="input-field" placeholder="110001" maxLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('state')}</label>
              <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                className="input-field" placeholder="राज्य" />
            </div>
          </div>

          {/* GPS */}
          <button onClick={handleGetLocation} className="btn-secondary w-full flex items-center justify-center gap-2">
            <FiMapPin size={16} /> 📍 GPS Location लें
          </button>

          {/* Skills (worker only) */}
          {user?.role === 'worker' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('skills')}</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button key={skill} onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${form.skills.includes(skill)
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                  >
                    {t(skill)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSave()}
            disabled={loading || !form.name || !form.district}
            className="btn-primary w-full"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              : t('save')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
