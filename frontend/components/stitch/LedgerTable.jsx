// from stitch-export: Recent exchanges / ledger table (see 2.html)
import { useRouter } from 'next/router';

export default function LedgerTable({ entries = [] }) {
  const router = useRouter();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div id="ledger-section" className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Recent Exchanges</h3>
        <button 
          onClick={() => router.push('/trades')}
          className="text-primary text-sm font-bold hover:underline transition-colors"
        >
          View All
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-2 opacity-20">
            receipt_long
          </span>
          <p className="text-sm">No exchanges yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  entry.change > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-orange-100 dark:bg-orange-900/20'
                }`}>
                  <span className={`material-symbols-outlined text-[20px] ${
                    entry.change > 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {entry.change > 0 ? 'add_circle' : 'remove_circle'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {entry.reason || entry.trade?.skill}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.trade?.provider?.name || entry.trade?.requester?.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              </div>
              <div className={`font-bold text-lg ${
                entry.change > 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {entry.change > 0 ? '+' : ''}{entry.change} hr{Math.abs(entry.change) !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
