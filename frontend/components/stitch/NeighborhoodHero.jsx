// Neighborhood Hero component (from Stitch design)
export default function NeighborhoodHero({ user }) {
  const totalHelps = user?.totalHelps || 0;
  const hoursContributed = totalHelps;

  // Determine badge level based on total helps
  const getBadgeInfo = () => {
    if (totalHelps >= 20) {
      return {
        name: 'Gold Badge',
        icon: '🏆',
        color: 'from-yellow-400 to-yellow-600',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    } else if (totalHelps >= 10) {
      return {
        name: 'Silver Badge',
        icon: '🥈',
        color: 'from-slate-300 to-slate-500',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-50',
      };
    } else if (totalHelps >= 5) {
      return {
        name: 'Bronze Badge',
        icon: '🥉',
        color: 'from-orange-400 to-orange-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
      };
    }
    return {
      name: 'Getting Started',
      icon: '⭐',
      color: 'from-primary to-green-500',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
    };
  };

  const badge = getBadgeInfo();

  return (
    <div className="bg-gradient-to-br from-primary/20 via-green-500/20 to-primary/20 rounded-2xl p-8 border border-primary/30 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 text-8xl opacity-10">
        {badge.icon}
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          Neighborhood Hero
        </h3>

        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
          You've saved your community{' '}
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            {hoursContributed} hours
          </span>{' '}
          of paid labor!
        </p>

        {/* Badge display */}
        <div className={`${badge.bgColor} dark:bg-slate-800/50 rounded-xl p-4 flex items-center gap-4`}>
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-lg`}>
            {badge.icon}
          </div>
          <div>
            <div className={`text-xs ${badge.textColor} dark:text-slate-400 font-semibold uppercase tracking-wide`}>
              Achievement Unlocked
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {badge.name}
            </div>
            {totalHelps < 20 && (
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {totalHelps < 5 && `${5 - totalHelps} more helps for Bronze`}
                {totalHelps >= 5 && totalHelps < 10 && `${10 - totalHelps} more helps for Silver`}
                {totalHelps >= 10 && totalHelps < 20 && `${20 - totalHelps} more helps for Gold`}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalHelps < 20 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>Progress to next level</span>
              <span>{totalHelps} / {totalHelps < 5 ? 5 : totalHelps < 10 ? 10 : 20}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                style={{
                  width: `${(totalHelps / (totalHelps < 5 ? 5 : totalHelps < 10 ? 10 : 20)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined text-primary text-base">volunteer_activism</span>
          <span>Keep up the great work!</span>
        </div>
      </div>
    </div>
  );
}
