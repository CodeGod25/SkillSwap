// Transfer Credits Modal Component
import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function TransferCreditsModal({ user, onClose, onSuccess }) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadNearbyUsers();
  }, []);

  const loadNearbyUsers = async () => {
    try {
      if (user?.lat && user?.lng) {
        const usersData = await api.getNearbyUsers(user.lat, user.lng, 10, '');
        // Backend returns array directly
        const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
        setNearbyUsers(users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setNearbyUsers([]);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      alert('Please select a recipient');
      return;
    }

    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (amount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      await api.transferCredits(selectedUser.id, amount, message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert('Transfer failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = nearbyUsers.filter(u => 
    u.id !== user?.id && u.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Transfer Credits
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Gift time credits to your neighbors
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Balance Display */}
          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Your Available Balance
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {user?.balance || 0} <span className="text-lg font-semibold">Credits</span>
            </p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Recipient
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search for a neighbor..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* Users List */}
          <div className="grid gap-2 mb-6 max-h-48 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No neighbors found</p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    selectedUser?.id === u.id
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {u.skills?.[0]?.name || 'SkillSwap Member'}
                    </p>
                  </div>
                  {selectedUser?.id === u.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Amount (Credits)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                type="number"
                min="1"
                max={user?.balance || 0}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary text-center text-lg font-bold"
              />
              <button
                onClick={() => setAmount(Math.min(user?.balance || 0, amount + 1))}
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedUser || loading || amount > (user?.balance || 0)}
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-slate-900 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Transferring...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Transfer {amount} Credit{amount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
