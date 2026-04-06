import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiLogOut, FiEdit2, FiStar, FiMapPin, FiPhone, FiBriefcase, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const allSkills = ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', district: user?.location?.district || '',
    village: user?.location?.village || '', pincode: user?.location?.pincode || '',
    state: user?.location?.state || '', skills: user?.skills || [],
    isGroupLeader: user?.isGroupLeader || false, teamSize: user?.teamSize || 1,
    isGroupLeader: user?.isGroupLeader || false, teamSize: user?.teamSize || 1,
    teamList: user?.teamList || []
  });
  const [newMember, setNewMember] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [verifyingKyc, setVerifyingKyc] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => { if (user?._id) fetchRatings(); }, [user]);

  const fetchRatings = async () => {
    try { const { data } = await api.get(`/ratings/user/${user._id}`); setRatings(data.ratings); } catch {}
  };

  const handleAddMember = () => {
    if (newMember.trim() && !form.teamList.includes(newMember.trim())) {
      setForm(p => ({ ...p, teamList: [...p.teamList, newMember.trim()] }));
      setNewMember('');
    }
  };

  const handleRemoveMember = (member) => {
    setForm(p => ({ ...p, teamList: p.teamList.filter(m => m !== member) }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ 
        name: form.name, location: { district: form.district, village: form.village, pincode: form.pincode, state: form.state },
        skills: user?.role === 'worker' ? form.skills : undefined,
        isGroupLeader: user?.role === 'worker' ? form.isGroupLeader : undefined,
        teamSize: user?.role === 'worker' ? parseInt(form.teamList.length ? form.teamList.length : form.teamSize) : undefined,
        teamList: user?.role === 'worker' ? form.teamList : undefined
      });
      toast.success('✅ Updated!'); setEditing(false);
    } catch { toast.error(t('error')); }
  };

  const handleKycSubmit = async () => {
    if (!/^\d{12}$/.test(aadhaarInput)) return toast.error('Please enter a valid 12-digit Aadhaar number');
    setVerifyingKyc(true);
    try {
      const { data } = await api.post('/auth/verify-kyc', { aadhaarNumber: aadhaarInput });
      toast.success('KYC Verified successfully!');
      // Force reload auth context or just reload page for now to get fresh user context
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || t('error'));
    } finally {
      setVerifyingKyc(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
            {user?.name?.charAt(0) || '?'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
            {user?.name}
            {user?.isVerified && <FiCheckCircle className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" size={20} title="Verified User" />}
          </h2>
          <div className="flex flex-col items-center gap-1.5 mt-1">
            <p className="text-sm font-medium text-gray-500">{user?.role === 'farmer' ? '🌾 ' + t('farmer') : '👷 ' + t('worker')}</p>
            {user?.role === 'worker' && user?.isGroupLeader && (
              <span className="text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 shadow-sm">
                👥 Group Leader (Team of {user.teamSize})
              </span>
            )}
          </div>
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
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map(skill => (
                      <button key={skill} onClick={() => setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }))}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${form.skills.includes(skill) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {t(skill)}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="isGroupLeader" checked={form.isGroupLeader} 
                        onChange={e => setForm(p => ({ ...p, isGroupLeader: e.target.checked }))} className="w-5 h-5 text-primary-600 rounded accent-primary-600" />
                      <label htmlFor="isGroupLeader" className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">I am a Group Leader ('Toli')</label>
                      {form.isGroupLeader && form.teamList.length === 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Team Size:</span>
                          <input type="number" value={form.teamSize} onChange={e => setForm(p => ({ ...p, teamSize: e.target.value }))}
                            className="w-16 p-1 text-center font-bold text-sm border rounded-lg dark:bg-gray-900 border-primary-300 dark:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500" min="1" max="100" />
                        </div>
                      )}
                    </div>
                    {form.isGroupLeader && (
                      <div className="w-full mt-2 p-3 bg-white dark:bg-gray-900 border border-primary-100 dark:border-primary-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Roster ({form.teamList?.length || 0} members)</p>
                        <div className="flex gap-2 mb-2">
                          <input type="text" value={newMember} onChange={e => setNewMember(e.target.value)} 
                            className="input-field text-xs py-1.5 px-2 flex-1" placeholder="Enter team member name..." />
                          <button type="button" onClick={handleAddMember} className="btn-primary py-1 px-3 text-xs w-auto">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.teamList?.map(m => (
                            <span key={m} className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                              👤 {m} <button type="button" onClick={() => handleRemoveMember(m)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold ml-1 text-xs leading-none">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
              {user?.skills?.length > 0 && <div className="flex flex-wrap gap-1 mt-2 mb-2">{user.skills.map(s => <span key={s} className="badge-green">{t(s)}</span>)}</div>}
            </div>
          )}
        </div>

        {/* KYC Section */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FiShield className={user?.isVerified ? "text-emerald-500" : "text-amber-500"} />
            <h3 className="font-semibold text-sm">Trust & Safety (KYC)</h3>
          </div>
          {user?.isVerified ? (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Identity Verified</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80">Your Aadhaar KYC is securely completed.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                Complete your Aadhaar KYC to get a "Verified" badge and priority placement.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aadhaarInput} 
                  onChange={e => setAadhaarInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="input-field text-sm font-medium tracking-widest text-center flex-1" 
                  placeholder="12-Digit Aadhaar" 
                />
                <button 
                  onClick={handleKycSubmit} 
                  disabled={verifyingKyc || aadhaarInput.length !== 12}
                  className="btn-primary"
                >
                  {verifyingKyc ? '...' : 'Verify'}
                </button>
              </div>
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
