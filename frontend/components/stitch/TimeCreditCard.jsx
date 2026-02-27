// from stitch-export: Time credit balance card (see 2.html)
import { useState } from 'react';
import { useRouter } from 'next/router';
import TransferCreditsModal from './TransferCreditsModal';

export default function TimeCreditCard({ balance = 5.5, user, onTransferSuccess }) {
  const router = useRouter();
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleViewHistory = () => {
    // Scroll to ledger table on dashboard
    const ledgerSection = document.getElementById('ledger-section');
    if (ledgerSection) {
      ledgerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTransferCredits = () => {
    setShowTransferModal(true);
  };

  const handleTransferSuccess = () => {
    setShowTransferModal(false);
    if (onTransferSuccess) {
      onTransferSuccess();
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary/20 via-background-light to-primary/5 dark:from-primary/10 dark:via-background-dark dark:to-transparent p-8 rounded-3xl border border-primary/10 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-primary font-bold uppercase tracking-wider text-xs">
            Available Balance
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-slate-900 dark:text-white">
              {balance}
            </span>
            <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              Hours
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            That's enough for a professional gardening session or 2 basic plumbing fixes!
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleViewHistory}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-transform hover:scale-105"
          >
            History
          </button>
          <button 
            onClick={handleTransferCredits}
            className="bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-slate-200 dark:border-slate-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/80 transition-colors"
          >
            Transfer Credits
          </button>
        </div>
      </div>
      {/* Abstract design element */}
      <div className="absolute -right-20 -bottom-20 size-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
    </div>
    
    {/* Transfer Credits Modal */}
    {showTransferModal && (
      <TransferCreditsModal
        user={user}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleTransferSuccess}
      />
    )}
    </>
  );
}
