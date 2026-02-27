import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import TradeRequestModal from '../components/stitch/TradeRequestModal';
import api from '../lib/api';

export default function TownSquare() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All Skills');
  const [tradeType, setTradeType] = useState('all'); // 'all', 'credits', 'exchange'
  const [minRating, setMinRating] = useState(0); // Minimum rating filter
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedType, setSelectedType] = useState('credit');

  const categories = [
    'All Skills',
    'Education',
    'Home Services',
    'Outdoor',
    'Culinary',
    'Fitness',
    'Creative',
    'Technology',
  ];

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [searchRadius]);

  const loadData = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);

      if (userData.lat && userData.lng) {
        const users = await api.getNearbyUsers(userData.lat, userData.lng, searchRadius, searchText);
        const usersArray = users.users || users || [];
        // Filter out current user and only show users with offered skills
        const providersWithSkills = usersArray.filter(
          u => u.id !== userData.id && u.skills?.some(s => s.kind === 'offer')
        );
        setProviders(providersWithSkills);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!user?.lat || !user?.lng) return;
    try {
      const users = await api.getNearbyUsers(user.lat, user.lng, searchRadius, searchText);
      const usersArray = users.users || users || [];
      const providersWithSkills = usersArray.filter(
        u => u.id !== user.id && u.skills?.some(s => s.kind === 'offer')
      );
      setProviders(providersWithSkills);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const filteredProviders = providers.filter(provider => {
    // Filter by minimum rating
    if (minRating > 0 && provider.rating < minRating) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Skills') {
      const skills = provider.skills?.filter(s => s.kind === 'offer').map(s => s.name.toLowerCase()).join(' ') || '';
      const category = selectedCategory.toLowerCase();
      
      let matchesCategory = false;
      if (category === 'education') {
        matchesCategory = /teach|tutor|education|python|spanish|language|programming/.test(skills);
      } else if (category === 'home services') {
        matchesCategory = /repair|fix|carpentry|home|plumb|handyman/.test(skills);
      } else if (category === 'outdoor') {
        matchesCategory = /garden|plant|pet|landscap|dog|cat/.test(skills);
      } else if (category === 'culinary') {
        matchesCategory = /cook|bak|food|chef/.test(skills);
      } else if (category === 'fitness') {
        matchesCategory = /fitness|yoga|train|exercise/.test(skills);
      } else if (category === 'creative') {
        matchesCategory = /photo|design|creative|art|music|guitar/.test(skills);
      } else if (category === 'technology') {
        matchesCategory = /web|programming|code|computer|tech|python/.test(skills);
      }
      
      if (!matchesCategory) return false;
    }
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesName = provider.name.toLowerCase().includes(searchLower);
      const matchesSkill = provider.skills?.some(s => s.name.toLowerCase().includes(searchLower));
      if (!matchesName && !matchesSkill) return false;
    }
    
    return true;
  });

  const getSkillColor = (skillName) => {
    const skill = skillName?.toLowerCase() || '';
    if (skill.includes('garden') || skill.includes('plant') || skill.includes('pet')) return 'bg-green-500';
    if (skill.includes('cook') || skill.includes('bak') || skill.includes('food')) return 'bg-orange-500';
    if (skill.includes('teach') || skill.includes('tutor') || skill.includes('education') || skill.includes('python') || skill.includes('spanish')) return 'bg-blue-500';
    if (skill.includes('repair') || skill.includes('fix') || skill.includes('carpentry') || skill.includes('home')) return 'bg-purple-500';
    if (skill.includes('music') || skill.includes('guitar') || skill.includes('piano')) return 'bg-pink-500';
    if (skill.includes('photo') || skill.includes('design') || skill.includes('creative')) return 'bg-indigo-500';
    if (skill.includes('fitness') || skill.includes('yoga') || skill.includes('training')) return 'bg-red-500';
    return 'bg-cyan-500';
  };

  const getLevelBadge = (level) => {
    const badges = {
      beginner: { emoji: '🌱', color: 'text-green-600', bg: 'bg-green-50' },
      intermediate: { emoji: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
      advanced: { emoji: '🎯', color: 'text-purple-600', bg: 'bg-purple-50' },
      expert: { emoji: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    };
    return badges[level] || badges.beginner;
  };

  const handleRequestService = (provider, skill, type) => {
    setSelectedProvider(provider);
    setSelectedSkill(skill);
    setSelectedType(type);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TownSquare - SkillSwap Marketplace</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-4xl text-primary">storefront</span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">TownSquare</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Discover skilled neighbors and exchange services with credits or skill trades
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Search Skills or Names
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Search for a skill..."
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Distance Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[45px]">
                    {searchRadius}km
                  </span>
                </div>
              </div>

              {/* Trade Type */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Payment Type
                </label>
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  <option value="credits">Credits Only</option>
                  <option value="exchange">Skill Exchange</option>
                </select>
              </div>
            </div>

            {/* Second Row: Rating Filter */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">⭐ 3.0+</option>
                  <option value="3.5">⭐ 3.5+</option>
                  <option value="4">⭐ 4.0+</option>
                  <option value="4.5">⭐ 4.5+</option>
                  <option value="4.8">⭐ 4.8+</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-3">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-slate-900 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-900">person</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredProviders.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Skill Providers</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">workspace_premium</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {filteredProviders.reduce((sum, p) => sum + p.skills?.filter(s => s.kind === 'offer' && s.isVerified).length, 0)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Verified Skills</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">local_atm</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.balance?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your Credits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => {
              const offeredSkills = provider.skills?.filter(s => s.kind === 'offer') || [];
              const primarySkill = offeredSkills[0];
              
              return (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full ${primarySkill ? getSkillColor(primarySkill.name) : 'bg-primary'} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                      {provider.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {provider.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span>{provider.distance?.toFixed(1) || '0.5'}km away</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        {provider.totalHelps > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-xs">handshake</span>
                            <span>{provider.totalHelps} {provider.totalHelps === 1 ? 'trade' : 'trades'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Available Services
                    </p>
                    <div className="space-y-2">
                      {offeredSkills.slice(0, 3).map((skill, idx) => {
                        const badge = getLevelBadge(skill.level);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                  {skill.name}
                                </span>
                                {skill.level && (
                                  <span className={`text-xs px-2 py-1 rounded ${badge.bg} ${badge.color} font-semibold`}>
                                    {badge.emoji} {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                                  </span>
                                )}
                                {skill.isVerified && (
                                  <span 
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded"
                                    title="Verified skill"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span>
                                  </span>
                                )}
                                {skill.yearsOfExp > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {skill.yearsOfExp}y
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {offeredSkills.length > 3 && (
                        <p className="text-xs text-slate-500 text-center">
                          +{offeredSkills.length - 3} more skills
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <button
                      onClick={() => router.push(`/user/${provider.id}`)}
                      className="w-full py-2.5 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">person</span>
                      View Profile
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRequestService(provider, primarySkill, 'credit')}
                        className="py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">payments</span>
                        <span className="hidden sm:inline">Credits</span>
                      </button>
                      <button
                        onClick={() => handleRequestService(provider, primarySkill, 'exchange')}
                        className="py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">swap_horiz</span>
                        <span className="hidden sm:inline">Exchange</span>
                      </button>
                    </div>
                    <button
                      onClick={() => router.push(`/messages?userId=${provider.id}`)}
                      className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      Send Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 block mb-4">
                person_search
              </span>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                No providers found matching your criteria
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Try adjusting your search filters or expanding the distance range
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Trade Request Modal */}
      <TradeRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        provider={selectedProvider}
        skill={selectedSkill}
        type={selectedType}
        user={user}
      />
    </>
  );
}
