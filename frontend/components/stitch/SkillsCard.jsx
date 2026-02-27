// from stitch-export: Skills offered/needed cards (see 2.html)

export default function SkillsCard({ title, skills = [], icon = 'volunteer_activism', onEdit, onAdd }) {
  
  const getLevelBadge = (level) => {
    const levels = {
      beginner: { emoji: '🌱', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      intermediate: { emoji: '📚', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      advanced: { emoji: '🎯', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      expert: { emoji: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    };
    return levels[level] || levels.beginner;
  };

  const showLevel = title.includes('Offer'); // Only show levels for offered skills

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <span>{title}</span>
        </h3>
        <button
          onClick={onEdit}
          className="text-primary text-sm font-bold hover:underline"
        >
          Edit
        </button>
      </div>
      
      {skills.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 block mb-2">
            {showLevel ? 'volunteer_activism' : 'help'}
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {showLevel ? 'No skills offered yet' : 'No skills needed yet'}
          </p>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Your First Skill
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => {
            const badge = showLevel && skill.level ? getLevelBadge(skill.level) : null;
            return (
              <div
                key={index}
                className="px-4 py-2 bg-primary/10 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium border border-primary/5 flex items-center gap-2"
              >
                <span>{skill.name || skill}</span>
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.color} font-semibold flex items-center gap-1`}>
                    {badge.emoji} {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                  </span>
                )}
                {showLevel && skill.isVerified && (
                  <span 
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded"
                    title="Verified skill"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span>
                  </span>
                )}
                {showLevel && skill.yearsOfExp > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {skill.yearsOfExp}y
                  </span>
                )}
              </div>
            );
          })}
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-sm font-medium border border-dashed border-slate-300 dark:border-slate-600 flex items-center gap-1 hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add</span> Add New
          </button>
        </div>
      )}
    </div>
  );
}
