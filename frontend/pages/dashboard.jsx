import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import TopNav from '../components/stitch/TopNav';
import SidebarFilters from '../components/stitch/SidebarFilters';
import BottomProfileCard from '../components/stitch/BottomProfileCard';
import DashboardHero from '../components/stitch/DashboardHero';
import TimeCreditCard from '../components/stitch/TimeCreditCard';
import SkillsCard from '../components/stitch/SkillsCard';
import LedgerTable from '../components/stitch/LedgerTable';
import NearbyNeighbors from '../components/stitch/NearbyNeighbors';
import NeighborhoodHero from '../components/stitch/NeighborhoodHero';
import api from '../lib/api';

// Dynamically import MapView with SSR disabled (Leaflet requires browser window)
const MapView = dynamic(() => import('../components/stitch/MapView'), {
  ssr: false,
});

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [weeklyHelps, setWeeklyHelps] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All Skills');
  const [allUsers, setAllUsers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('find'); // 'find' or 'learners'

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?.lat && user?.lng) {
      loadNearbyUsers();
    }
  }, [user?.lat, user?.lng, searchRadius]);

  const loadUserData = async () => {
    try {
      const userData = await api.getMe();
      console.log('Dashboard: Loaded user data:', userData);
      console.log('Dashboard: User totalHelps:', userData.totalHelps);
      setUser(userData);

      const ledgerData = await api.getLedger();
      setLedgerEntries(ledgerData.entries || []);

      const statsData = await api.getWeeklyHelps();
      setWeeklyHelps(statsData.weeklyHelps || 0);

      setLoading(false);
    } catch (error) {
      console.error('Dashboard: Failed to load user data:', error);
      router.push('/login');
    }
  };

  const loadNearbyUsers = async (search = '') => {
    if (!user?.lat || !user?.lng) return;

    try {
      console.log('Loading nearby users:', { lat: user.lat, lng: user.lng, radius: searchRadius, search });
      const usersData = await api.getNearbyUsers(user.lat, user.lng, searchRadius, search);
      console.log('Received nearby users data:', usersData);
      // Backend returns array directly
      const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
      console.log('Parsed users array:', users.length, 'users');
      
      // Filter out the current user from the results
      const otherUsers = users.filter(u => u.id !== user.id);
      console.log('After excluding current user:', otherUsers.length, 'users');
      
      // Enhance users with color based on their primary skill
      const enhancedUsers = otherUsers.map((u) => {
        const primarySkill = u.skills?.[0]?.name?.toLowerCase() || '';
        let color = 'bg-primary';
        
        // Assign colors based on skill categories
        if (primarySkill.includes('garden') || primarySkill.includes('plant') || primarySkill.includes('landscap')) {
          color = 'bg-green-500';
        } else if (primarySkill.includes('cook') || primarySkill.includes('baking') || primarySkill.includes('chef')) {
          color = 'bg-orange-500';
        } else if (primarySkill.includes('teach') || primarySkill.includes('tutor') || primarySkill.includes('python') || primarySkill.includes('spanish') || primarySkill.includes('education') || primarySkill.includes('programming') || primarySkill.includes('language')) {
          color = 'bg-blue-500';
        } else if (primarySkill.includes('repair') || primarySkill.includes('plumb') || primarySkill.includes('carpent') || primarySkill.includes('home') || primarySkill.includes('handyman')) {
          color = 'bg-purple-500';
        } else if (primarySkill.includes('music') || primarySkill.includes('piano') || primarySkill.includes('guitar') || primarySkill.includes('lesson')) {
          color = 'bg-pink-500';
        } else if (primarySkill.includes('pet') || primarySkill.includes('dog') || primarySkill.includes('cat') || primarySkill.includes('animal')) {
          color = 'bg-cyan-500';
        } else if (primarySkill.includes('fitness') || primarySkill.includes('yoga') || primarySkill.includes('train') || primarySkill.includes('exercise')) {
          color = 'bg-red-500';
        } else if (primarySkill.includes('photo') || primarySkill.includes('design') || primarySkill.includes('art') || primarySkill.includes('creative')) {
          color = 'bg-indigo-500';
        }
        
        return {
          ...u,
          color,
          skill: u.skills?.[0]?.name || 'General Help',
          creditsPerHour: 1,
        };
      });
      
      console.log('Enhanced users:', enhancedUsers.length, 'users with colors');
      
      setAllUsers(enhancedUsers);
      console.log('Set allUsers to:', enhancedUsers.length, 'users');
      
      // If no category filter is active, set nearbyUsers directly
      if (!selectedCategory || selectedCategory === 'All Skills') {
        console.log('No filter active, setting nearbyUsers directly');
        setNearbyUsers(enhancedUsers);
      }
    } catch (error) {
      console.error('Failed to load nearby users:', error);
      setNearbyUsers([]);
    }
  };

  const handleSearch = (searchText) => {
    loadNearbyUsers(searchText);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    console.log('Category useEffect triggered - selectedCategory:', selectedCategory, 'allUsers:', allUsers.length);
    if (allUsers.length > 0) {
      console.log('Category changed to:', selectedCategory, '- Processing', allUsers.length, 'allUsers');
      // Apply category filter whenever selectedCategory changes
      if (selectedCategory && selectedCategory !== 'All Skills') {
        const filtered = allUsers.filter(u => {
          const skills = u.skills?.map(s => s.name.toLowerCase()).join(' ') || '';
          const category = selectedCategory.toLowerCase();
          
          if (category === 'education') {
            return skills.includes('teach') || skills.includes('tutor') || skills.includes('education') || 
                   skills.includes('python') || skills.includes('spanish') || skills.includes('language') || skills.includes('programming');
          } else if (category === 'home services') {
            return skills.includes('repair') || skills.includes('fix') || skills.includes('carpentry') || 
                   skills.includes('home') || skills.includes('plumb') || skills.includes('handyman');
          } else if (category === 'outdoor') {
            return skills.includes('garden') || skills.includes('plant') || skills.includes('pet') || 
                   skills.includes('landscap') || skills.includes('dog') || skills.includes('cat');
          } else if (category === 'culinary') {
            return skills.includes('cook') || skills.includes('bak') || skills.includes('food') || 
                   skills.includes('chef');
          } else if (category === 'fitness') {
            return skills.includes('fitness') || skills.includes('yoga') || skills.includes('train') || 
                   skills.includes('exercise');
          } else if (category === 'creative') {
            return skills.includes('photo') || skills.includes('design') || skills.includes('creative') || 
                   skills.includes('art') || skills.includes('music') || skills.includes('guitar');
          } else if (category === 'technology') {
            return skills.includes('web') || skills.includes('programming') || skills.includes('code') || 
                   skills.includes('computer') || skills.includes('tech') || skills.includes('python');
          }
          return true;
        });
        console.log('Category useEffect - Filtered to:', filtered.length, 'users for category:', selectedCategory);
        setNearbyUsers(filtered);
      } else {
        console.log('Category useEffect - No filter, showing all', allUsers.length, 'users');
        setNearbyUsers(allUsers);
      }
    } else if (allUsers.length === 0) {
      console.log('allUsers is empty, setting nearbyUsers to empty array');
      setNearbyUsers([]);
    }
  }, [selectedCategory, allUsers]);

  const handleDistanceChange = (distance) => {
    setSearchRadius(distance);
  };

  const handleModeChange = async (mode) => {
    setViewMode(mode);
    if (mode === 'learners') {
      // Load users who want to learn my offered skills
      await loadLearners();
    } else {
      // Reload nearby users
      if (user?.lat && user?.lng) {
        loadNearbyUsers();
      }
    }
  };

  const loadLearners = async () => {
    if (!user?.skills) return;

    const myOfferedSkills = user.skills.filter(s => s.kind === 'offer');
    if (myOfferedSkills.length === 0) {
      setNearbyUsers([]);
      return;
    }

    try {
      // Get nearby users who need the skills I offer
      const usersData = await api.getNearbyUsers(user.lat, user.lng, searchRadius, '');
      const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
      
      // Filter for users who are learning (need) the skills I offer
      const learners = users.filter(u => {
        if (u.id === user.id) return false;
        return u.skills?.some(skill => 
          skill.kind === 'need' && 
          myOfferedSkills.some(mySkill => 
            skill.name.toLowerCase().includes(mySkill.name.toLowerCase()) ||
            mySkill.name.toLowerCase().includes(skill.name.toLowerCase())
          )
        );
      });

      // Enhance with colors
      const enhancedLearners = learners.map(u => ({
        ...u,
        color: 'bg-blue-500', // Blue for learners
        skill: u.skills?.find(s => s.kind === 'need')?.name || 'General Help',
        creditsPerHour: 1
      }));

      setAllUsers(enhancedLearners);
      setNearbyUsers(enhancedLearners);
    } catch (error) {
      console.error('Failed to load learners:', error);
      setNearbyUsers([]);
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedUser(marker);
  };

  const handleRequestTrade = async (targetUser) => {
    try {
      await api.createTrade(
        targetUser.id,
        user.id,
        targetUser.skills?.[0]?.name || 'General Help',
        1
      );
      alert('Trade request sent!');
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to create trade:', error);
      alert('Failed to send trade request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const offeredSkills = user?.skills?.filter((s) => s.kind === 'offer') || [];
  const neededSkills = user?.skills?.filter((s) => s.kind === 'need') || [];

  return (
    <>
      <Head>
        <title>Dashboard - SkillSwap</title>
      </Head>

      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="flex flex-1 relative overflow-hidden">
          {/* Sidebar toggle button (mobile) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="fixed top-20 left-4 z-[1003] lg:hidden bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">
              {sidebarCollapsed ? 'menu' : 'close'}
            </span>
          </button>

          {/* Sidebar with filters */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'flex'} lg:flex transition-all duration-300 relative`}>
            <SidebarFilters
              balance={user?.balance || 0}
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
              onDistanceChange={handleDistanceChange}
              onModeChange={handleModeChange}
              selectedDistance={searchRadius}
              nearbyCount={nearbyUsers.length}
            />
            {/* Desktop sidebar collapse button */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:block absolute top-4 right-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
              title="Hide sidebar"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
          </div>

          {/* Expand sidebar button when collapsed on desktop */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 bg-primary text-slate-900 rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-[1000]"
              title="Show sidebar"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
            {/* Left: Dashboard cards */}
            <div className={`w-full ${rightPanelCollapsed ? 'xl:w-full' : 'xl:w-1/2'} overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 transition-all duration-300`}>
              <DashboardHero userName={user?.name?.split(' ')[0] || 'User'} weeklyHelps={weeklyHelps} />

              <TimeCreditCard 
                balance={user?.balance || 0} 
                user={user}
                onTransferSuccess={loadUserData}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <SkillsCard
                  title="Skills You Offer"
                  skills={offeredSkills}
                  icon="volunteer_activism"
                  onEdit={() => router.push('/profile')}
                  onAdd={() => router.push('/profile')}
                />

                <SkillsCard
                  title="Skills You Need"
                  skills={neededSkills}
                  icon="help"
                  onEdit={() => router.push('/profile')}
                  onAdd={() => router.push('/profile')}
                />
              </div>

              <LedgerTable entries={ledgerEntries.slice(0, 5)} />
              
              {/* Mobile: Show community features on small screens */}
              <div className="xl:hidden space-y-4 md:space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community</h2>
                <NearbyNeighbors 
                  neighbors={nearbyUsers} 
                  totalCount={nearbyUsers.length} 
                  searchRadius={searchRadius}
                  userLocation={{ lat: user?.lat, lng: user?.lng }}
                />
                {user && <NeighborhoodHero user={user} />}
              </div>
            </div>

            {/* Right: Nearby Neighbors and Neighborhood Hero */}
            {!rightPanelCollapsed && (
              <div className="w-full xl:w-1/2 h-full overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 transition-all duration-300 hidden xl:block">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community</h2>
                  <button
                    onClick={() => setRightPanelCollapsed(true)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Hide panel"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <NearbyNeighbors 
                  neighbors={nearbyUsers} 
                  totalCount={nearbyUsers.length}
                  searchRadius={searchRadius}
                  userLocation={{ lat: user?.lat, lng: user?.lng }}
                />
                
                {user && <NeighborhoodHero user={user} />}
              </div>
            )}

            {/* Expand button when right panel is collapsed */}
            {rightPanelCollapsed && (
              <button
                onClick={() => setRightPanelCollapsed(false)}
                className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 bg-primary text-slate-900 rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-[1000]"
                title="Show community panel"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
          </div>
        </main>

        {/* Floating profile card when marker selected */}
        {selectedUser && (
          <BottomProfileCard user={selectedUser} onRequestTrade={handleRequestTrade} />
        )}
      </div>
    </>
  );
}
