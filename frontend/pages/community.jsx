import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import api from '../lib/api';

export default function Community() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(5);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Read distance from URL query params
    const { distance } = router.query;
    if (distance) {
      setSearchRadius(parseInt(distance, 10));
    }
    
    loadData();
  }, [router.query.distance]);

  const loadData = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);

      if (userData.lat && userData.lng) {
        const users = await api.getNearbyUsers(userData.lat, userData.lng, searchRadius, searchText);
        const usersArray = users.users || users || [];
        // Filter out the current user from the list
        const filteredUsers = usersArray.filter(u => u.id !== userData.id);
        setNearbyUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Failed to load community:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when search radius or search text changes
  useEffect(() => {
    if (user?.lat && user?.lng) {
      const delayDebounce = setTimeout(() => {
        loadData();
      }, 300);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [searchRadius, searchText]);

  // Filter users locally based on search text
  const filteredUsers = nearbyUsers.filter(u => 
    u.name.toLowerCase().includes(searchText.toLowerCase()) ||
    u.skills?.some(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getSkillColor = (skillName) => {
    const skill = skillName.toLowerCase();
    if (skill.includes('garden') || skill.includes('plant') || skill.includes('pet')) return 'bg-green-500';
    if (skill.includes('cook') || skill.includes('bak') || skill.includes('food')) return 'bg-orange-500';
    if (skill.includes('teach') || skill.includes('tutor') || skill.includes('education') || skill.includes('python') || skill.includes('spanish')) return 'bg-blue-500';
    if (skill.includes('repair') || skill.includes('fix') || skill.includes('carpentry') || skill.includes('home')) return 'bg-purple-500';
    if (skill.includes('music') || skill.includes('guitar') || skill.includes('piano')) return 'bg-pink-500';
    if (skill.includes('photo') || skill.includes('design') || skill.includes('creative')) return 'bg-indigo-500';
    if (skill.includes('fitness') || skill.includes('yoga') || skill.includes('training')) return 'bg-red-500';
    return 'bg-cyan-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Community - SkillSwap</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Community</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discover talented neighbors in your area
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary text-sm placeholder:text-slate-400"
                placeholder="Search by name or skill..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            {/* Distance Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-xl px-6 py-3 border border-slate-200 dark:border-slate-700 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Distance Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[50px]">
                  {searchRadius}km
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">group</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{nearbyUsers.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Community Members</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500">handshake</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {nearbyUsers.reduce((sum, u) => sum + (u.skills?.filter(s => s.kind === 'offer').length || 0), 0)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Skills Offered</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-500">location_on</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{searchRadius}km</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Search Radius</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((member) => {
              const offeredSkills = member.skills?.filter(s => s.kind === 'offer') || [];
              const primarySkill = offeredSkills[0];
              
              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full ${primarySkill ? getSkillColor(primarySkill.name) : 'bg-primary'} flex items-center justify-center text-white font-bold text-xl`}>
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span>{member.distance?.toFixed(1) || '0.5'}km away</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                        {member.balance || 0} credits
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Offers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {offeredSkills.length > 0 ? (
                        offeredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No skills offered yet</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/user/${member.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">search_off</span>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
                No members found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
