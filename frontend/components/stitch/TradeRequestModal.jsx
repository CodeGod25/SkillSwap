import { useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/router';

export default function TradeRequestModal({ 
  isOpen, 
  onClose, 
  provider, 
  skill, 
  type, // 'credit' or 'exchange'
  user 
}) {
  const router = useRouter();
  const [hours, setHours] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user's offered skills for exchange
  const userOfferedSkills = user?.skills?.filter(s => s.kind === 'offer') || [];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('Creating trade:', { 
        providerId: provider.id, 
        requesterId: user.id, 
        skill: skill.name, 
        hours, 
        type 
      });

      if (type === 'credit') {
        // Check if user has enough balance
        const totalCost = hours;
        if (user?.balance < totalCost) {
          setError(`Insufficient credits. You need ${totalCost} credits but only have ${user.balance.toFixed(1)}. Earn more by helping neighbors!`);
          setLoading(false);
          return;
        }

        // Create trade with credits
        const result = await api.createTrade(
          provider.id,
          user.id,
          skill.name,
          hours
        );
        console.log('Trade created successfully:', result);
      } else {
        // Exchange mode
        if (!selectedSkill) {
          setError('Please select a skill to offer in exchange');
          setLoading(false);
          return;
        }

        // Create exchange trade with skill info embedded in the skill name
        const exchangeSkillInfo = `${skill.name} [in exchange for ${selectedSkill}]`;
        const result = await api.createTrade(
          provider.id,
          user.id,
          exchangeSkillInfo,
          1 // Use 1 hour for exchanges as placeholder
        );
        console.log('Exchange trade created successfully:', result);
      }

      // Success! Close modal and redirect to trades page
      setLoading(false);
      onClose();
      setTimeout(() => {
        router.push('/trades');
      }, 100);
    } catch (err) {
      console.error('Trade creation error:', err);
      setError(err.message || err.error || 'Failed to create trade request');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-primary">
              {type === 'credit' ? 'payments' : 'swap_horiz'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {type === 'credit' ? 'Request with Credits' : 'Offer Skill Exchange'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Info */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Service Provider
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                {provider?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{provider?.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{skill?.name}</p>
              </div>
            </div>
          </div>

          {type === 'credit' ? (
            <>
              {/* Hours Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  How many hours do you need?
                </label>
                <select
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                    <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Cost Summary */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Cost</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{hours} credits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Your Balance</span>
                  <span className={`font-semibold ${user?.balance >= hours ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.balance?.toFixed(1) || '0.0'} credits
                  </span>
                </div>
                {user?.balance < hours && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-xs text-orange-600 dark:text-orange-400 flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>You don't have enough credits. Earn more by helping your neighbors!</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Exchange Skill Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What skill would you like to offer in exchange?
                </label>
                {userOfferedSkills.length > 0 ? (
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a skill...</option>
                    {userOfferedSkills.map((s, idx) => (
                      <option key={idx} value={s.name}>
                        {s.name} {s.level && `(${s.level.charAt(0).toUpperCase() + s.level.slice(1)})`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <p className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-2">
                      <span className="material-symbols-outlined text-lg">info</span>
                      <span>You don't have any skills marked as "offer" yet. Add skills to your profile first!</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to your exchange proposal..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (type === 'exchange' && !selectedSkill)}
            className="flex-1 py-3 px-4 rounded-lg bg-primary text-slate-900 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
