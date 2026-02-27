// from stitch-export: Dashboard hero welcome section (see 2.html)
export default function DashboardHero({ userName = 'Alex', weeklyHelps = 3 }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        Welcome back, {userName}!
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">
        You've helped {weeklyHelps} neighbors this week.
      </p>
    </div>
  );
}
