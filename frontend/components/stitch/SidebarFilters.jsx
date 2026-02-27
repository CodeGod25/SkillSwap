// from stitch-export: Sidebar filters panel (see 1.html)
import { useState } from 'react';

const CATEGORIES = [
  { name: 'All Skills', icon: 'grid_view', color: 'text-primary' },
  { name: 'Education', icon: 'school', color: 'text-blue-500' },
  { name: 'Home Services', icon: 'home_repair_service', color: 'text-purple-500' },
  { name: 'Outdoor', icon: 'potted_plant', color: 'text-green-500' },
  { name: 'Culinary', icon: 'restaurant', color: 'text-orange-500' },
  { name: 'Fitness', icon: 'fitness_center', color: 'text-red-500' },
  { name: 'Creative', icon: 'palette', color: 'text-pink-500' },
  { name: 'Technology', icon: 'computer', color: 'text-cyan-500' },
];

const DISTANCE_OPTIONS = [
  { label: '1km', value: 1 },
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
];

export default function SidebarFilters({ 
  balance = 0, 
  onSearch, 
  onCategoryChange, 
  onDistanceChange,
  selectedDistance = 1,
  nearbyCount = 0,
  onModeChange // New prop for learner mode toggle
}) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Skills');
  const [mode, setMode] = useState('find'); // 'find' or 'learners'

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (onCategoryChange) onCategoryChange(category);
  };

  const handleDistanceClick = (distance) => {
    if (onDistanceChange) onDistanceChange(distance);
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  return (
    <aside className="w-full md:w-72 lg:w-80 h-full bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col z-40 shadow-xl overflow-y-auto">
      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <div>
          <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
            {mode === 'find' ? 'Find local help' : 'Skill Learners'}
          </h1>
          <p className="text-slate-500 text-sm">
            {mode === 'find' 
              ? (nearbyCount > 0 
                  ? `${nearbyCount} neighbor${nearbyCount !== 1 ? 's' : ''} found nearby` 
                  : 'Discover skills in your neighborhood')
              : 'People who want to learn your skills'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => handleModeToggle('find')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              mode === 'find'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">search</span>
            Find Skills
          </button>
          <button
            onClick={() => handleModeToggle('learners')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              mode === 'learners'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">school</span>
            Who Learns
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm placeholder:text-slate-400"
            placeholder="What do you need help with?"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Categories
          </p>
          {CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                selectedCategory === category.name
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${category.color}`}>
                {category.icon}
              </span>
              <span className="text-sm font-medium flex-1 text-left">{category.name}</span>
              {category.count && (
                <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Distance Range
            </p>
            <span className="text-sm font-bold text-primary">{selectedDistance}km</span>
          </div>
          
          {/* Dynamic Range Slider */}
          <div className="relative">
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={selectedDistance}
              onChange={(e) => handleDistanceClick(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((selectedDistance - 1) / 49) * 100}%, rgb(226 232 240) ${((selectedDistance - 1) / 49) * 100}%, rgb(226 232 240) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1km</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
          
          {/* Quick select buttons */}
          <div className="flex gap-2">
            {DISTANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDistanceClick(option.value)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDistance === option.value
                    ? 'border border-primary text-primary bg-primary/5'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Balance card at bottom */}
      <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="bg-primary rounded-2xl p-4 text-background-dark relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-70 mb-1">YOUR BALANCE</p>
            <h3 className="text-2xl font-black">{balance} Credits</h3>
            <p className="text-xs mt-2 font-semibold">Earn more by helping neighbors!</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
            database
          </span>
        </div>
      </div>
    </aside>
  );
}
