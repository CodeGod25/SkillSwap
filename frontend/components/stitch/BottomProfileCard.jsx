// from stitch-export: Bottom floating profile card (see 1.html marker popup)

export default function BottomProfileCard({ user, onRequestTrade }) {
  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-primary/10 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {user.name?.charAt(0)}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              {user.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user.skill || user.skills?.[0]?.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                  star
                </span>
                <span className="text-xs font-medium">{user.rating || '5.0'}</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {user.distance}km away
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-primary">
                {user.creditsPerHour || 1} credit/hr
              </span>
            </div>
          </div>

          <button
            onClick={() => onRequestTrade && onRequestTrade(user)}
            className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">handshake</span>
            <span>Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}
