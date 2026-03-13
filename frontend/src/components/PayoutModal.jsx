import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiX, FiDollarSign, FiStar, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PayoutModal({ isOpen, onClose, worker, job, onComplete }) {
  const { t } = useTranslation();
  const [daysWorked, setDaysWorked] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [upi, setUpi] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      setDaysWorked(job.workersNeeded || 1);
      setAmountPaid(job.wageAmount || 0); // Suggest base wage
      setPaymentMethod('cash');
      setUpi('');
      setRating(5);
      setReview('');
    }
  }, [isOpen, job]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!daysWorked || !amountPaid) return toast.error('Please fill required fields (Days, Amount)');
    
    setSubmitting(true);
    await onComplete({
      daysWorked: Number(daysWorked),
      amountPaid: Number(amountPaid),
      paymentMethod,
      upiTransactionId: paymentMethod === 'upi' ? upi : undefined,
      rating,
      review
    });
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 shrink-0 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <FiDollarSign className="text-gold-300" /> Settle & Complete
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full bg-black/10">
              <FiX size={20} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600">
                {worker?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{worker?.name}</p>
                <p className="text-xs text-gray-500">Completing work for "{job?.title}"</p>
              </div>
            </div>

            <form id="payout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <FiCalendar /> Units/Days Worked
                  </label>
                  <input type="number" step="0.5" value={daysWorked} onChange={e => setDaysWorked(e.target.value)} required
                    className="input-field text-lg font-bold w-full" placeholder="e.g. 3" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <FiDollarSign /> Amount Paid (₹)
                  </label>
                  <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required
                    className="input-field text-lg font-bold w-full text-emerald-600" placeholder="0" min="0" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'}`}>
                    💵 Cash
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'}`}>
                    📱 UPI (External)
                  </button>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">UPI Transaction ID (Optional)</label>
                  <input type="text" value={upi} onChange={e => setUpi(e.target.value)}
                    className="input-field w-full text-sm" placeholder="e.g. 1xxx90xxx" />
                </motion.div>
              )}

              <hr className="border-gray-100 dark:border-gray-800" />

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Rate Worker</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="p-1 focus:outline-none transition-transform hover:scale-110">
                      <FiStar size={28} className={star <= rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300 dark:text-gray-600'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback (Optional)</label>
                <textarea value={review} onChange={e => setReview(e.target.value)}
                  className="input-field w-full text-sm h-20 resize-none" placeholder="How did they do?" />
              </div>
            </form>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button form="payout-form" type="submit" disabled={submitting}
              className="w-full btn-primary bg-gradient-to-r from-emerald-500 to-teal-600 py-3 shadow-glow-green">
              {submitting ? 'Processing...' : 'Complete & Pay Worker'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
