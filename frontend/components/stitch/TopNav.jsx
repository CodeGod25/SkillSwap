// from stitch-export: Top navigation bar (see 1.html, 2.html, 3.html, 4.html)
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function TopNav({ user }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await api.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleGiveHelp = () => {
    // Navigate to profile to add/manage offered skills
    router.push('/profile');
  };

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-8 py-3 z-[1002] relative">
      <div className="flex items-center gap-2 md:gap-3">
        <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
          <div className="size-7 md:size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
            <span className="material-symbols-outlined font-bold text-base md:text-xl">handshake</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold tracking-tight">
            SkillSwap
          </h2>
        </Link>
      </div>
      
      {user && (
        <nav className="hidden md:flex flex-1 justify-center gap-6 lg:gap-8">
          <Link href="/dashboard" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/townsquare" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-base">storefront</span>
            TownSquare
          </Link>
          <Link href="/trades" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
            My Trades
          </Link>
          <Link href="/community" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
            Community
          </Link>
          <Link href="/messages" className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors relative">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </nav>
      )}
      
      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <>
            <button 
              onClick={handleGiveHelp}
              className="flex cursor-pointer items-center justify-center rounded-xl h-9 md:h-10 px-3 md:px-4 md:min-w-[120px] bg-primary text-background-dark text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-base md:text-lg md:mr-1">add_circle</span>
              <span className="hidden md:inline">Offer a Skill</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-primary/10 flex items-center justify-center hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">account_circle</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-[1001]">
                  <Link 
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">person</span>
                      Profile
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Log Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
              Login
            </Link>
            <Link href="/signup" className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary text-background-dark text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Join Now
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
