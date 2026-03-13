import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiLogOut, FiEdit2, FiStar, FiMapPin, FiPhone, FiBriefcase } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const allSkills = ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', district: user?.location?.district || '',
    village: user?.location?.village || '', pincode: user?.location?.pincode || '',
    state: user?.location?.state || '', skills: user?.skills || []
  });
  const [ratings, setRatings] = useState([]);

  useEffect(() => { if (user?._id) fetchRatings(); }, [user]);

  const fetchRatings = async () => {
    try { const { data } = await api.get(`/ratings/user/${user._id}`); setRatings(data.ratings); } catch {}
  };

  const handleSave = async () => {
    try {
      await updateProfile({ name: form.name, location: { district: form.district, village: form.village, pincode: form.pincode, state: form.state },
        skills: user?.role === 'worker' ? form.skills : undefined });
      toast.success('✅ Updated!'); setEditing(false);
    } catch { toast.error(t('error')); }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
            {user?.name?.charAt(0) || '?'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.role === 'farmer' ? '🌾 ' + t('farmer') : '👷 ' + t('worker')}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1"><FiPhone size={14} /> {user?.phone}</span>
            <span className="flex items-center gap-1"><FiStar size={14} className="text-amber-500" /> {user?.averageRating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiMapPin className="text-red-500" />
            <h3 className="font-semibold text-sm">Location</h3>
            <button onClick={() => setEditing(!editing)} className="ml-auto text-primary-600"><FiEdit2 size={14} /></button>
          </div>
          {editing ? (
            <div className="space-y-3 mt-3">
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder={t('name')} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="input-field" placeholder={t('district')} />
                <input type="text" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} className="input-field" placeholder={t('village')} />
              </div>
              {user?.role === 'worker' && (
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button key={skill} onClick={() => setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${form.skills.includes(skill) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {t(skill)}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1">{t('cancel')}</button>
                <button onClick={handleSave} className="btn-primary flex-1">{t('save')}</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{user?.location?.village && `${user.location.village}, `}{user?.location?.district}</p>
              {user?.skills?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{user.skills.map(s => <span key={s} className="badge-green">{t(s)}</span>)}</div>}
            </div>
          )}
        </div>
        {ratings.length > 0 && (
          <div className="card mb-4">
            <h3 className="font-semibold text-sm mb-3">⭐ {t('rating')} ({ratings.length})</h3>
            {ratings.slice(0, 5).map(r => (
              <div key={r._id} className="border-b border-gray-100 dark:border-gray-800 pb-2 mb-2 last:border-0">
                <div className="flex gap-2 items-center"><span className="text-sm font-medium">{r.fromUser?.name}</span><span className="text-xs text-amber-500">{'⭐'.repeat(r.score)}</span></div>
                {r.review && <p className="text-xs text-gray-500 mt-1">"{r.review}"</p>}
              </div>
            ))}
          </div>
        )}
        <button onClick={logout} className="btn-danger w-full flex items-center justify-center gap-2"><FiLogOut size={16} /> {t('logout')}</button>
      </motion.div>
    </div>
  );
}
