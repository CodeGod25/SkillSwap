import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import ReviewModal from '../components/stitch/ReviewModal';
import api from '../lib/api';

export default function Trades() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed, cancelled
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTradeForReview, setSelectedTradeForReview] = useState(null);
  const [reviewedTrades, setReviewedTrades] = useState(new Set());

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
    
    // Auto-refresh trades every 10 seconds to catch new exchanges
    const interval = setInterval(() => {
      loadData(true); // Pass true to indicate background refresh
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const userData = await api.getMe();
      setUser(userData);

      const tradesData = await api.getTrades();
      console.log('Trades received from API:', tradesData);
      // Backend returns array directly, not wrapped in object
      setTrades(Array.isArray(tradesData) ? tradesData : []);
      
      // Check which completed trades have been reviewed
      const completedTrades = (Array.isArray(tradesData) ? tradesData : []).filter(t => t.status === 'completed');
      const reviewed = new Set();
      
      for (const trade of completedTrades) {
        try {
          const { hasReviewed } = await api.checkTradeReview(trade.id);
          if (hasReviewed) {
            reviewed.add(trade.id);
          }
        } catch (error) {
          console.error(`Failed to check review status for trade ${trade.id}:`, error);
        }
      }
      
      setReviewedTrades(reviewed);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenReviewModal = (trade) => {
    setSelectedTradeForReview(trade);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating, comment) => {
    if (!selectedTradeForReview) return;
    
    const trade = selectedTradeForReview;
    // Determine who to review (the other party in the trade)
    const revieweeId = trade.providerId === user?.id ? trade.requesterId : trade.providerId;
    
    try {
      await api.submitReview(trade.id, revieweeId, rating, comment);
      
      // Mark trade as reviewed
      setReviewedTrades(prev => new Set([...prev, trade.id]));
      
      alert('Review submitted successfully!');
      setReviewModalOpen(false);
      setSelectedTradeForReview(null);
    } catch (error) {
      throw error; // Let ReviewModal handle the error display
    }
  };

  const getReviewee = (trade) => {
    if (!trade || !user) return null;
    return trade.providerId === user.id ? trade.requester : trade.provider;
  };

  const handleCompleteTrade = async (tradeId) => {
    try {
      await api.completeTrade(tradeId);
      loadData(); // Reload data
    } catch (error) {
      alert('Failed to complete trade: ' + error.message);
    }
  };

  const handleCancelTrade = async (tradeId) => {
    if (!confirm('Are you sure you want to cancel this trade?')) return;
    
    try {
      await api.cancelTrade(tradeId);
      loadData(); // Reload data
    } catch (error) {
      alert('Failed to cancel trade: ' + error.message);
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (activeTab === 'pending') return trade.status === 'pending';
    if (activeTab === 'completed') return trade.status === 'completed';
    if (activeTab === 'cancelled') return trade.status === 'cancelled';
    return true;
  });

  const getTradePartnerName = (trade) => {
    if (trade.providerId === user?.id) {
      return trade.requester?.name || 'Unknown';
    }
    return trade.provider?.name || 'Unknown';
  };

  const getTradeRole = (trade) => {
    return trade.providerId === user?.id ? 'Provider' : 'Requester';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Trades - SkillSwap</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Trades</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  View and manage your skill exchange trades
                </p>
              </div>
              <div className="flex items-center gap-3">
                {refreshing && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    <span className="font-medium">Updating...</span>
                  </div>
                )}
                <button
                  onClick={() => loadData()}
                  disabled={loading || refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refresh trades"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
            {['pending', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
                <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {trades.filter(t => t.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* Trades List */}
          {filteredTrades.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">shopping_bag</span>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
                No {activeTab} trades
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {activeTab === 'pending' 
                  ? 'Start a new trade from the dashboard map!' 
                  : `You don't have any ${activeTab} trades yet.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          handshake
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {trade.skill}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            With {getTradePartnerName(trade)} • You are the {getTradeRole(trade)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                          <span className="text-slate-600 dark:text-slate-400">{trade.hours} hour{trade.hours !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {trade.completedAt && (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              Completed {new Date(trade.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {trade.status === 'pending' && getTradeRole(trade) === 'Provider' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCompleteTrade(trade.id)}
                          className="px-4 py-2 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleCancelTrade(trade.id)}
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {trade.status === 'pending' && getTradeRole(trade) === 'Requester' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelTrade(trade.id)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                    {trade.status === 'completed' && !reviewedTrades.has(trade.id) && (
                      <button
                        onClick={() => handleOpenReviewModal(trade)}
                        className="px-4 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">star</span>
                        Leave Review
                      </button>
                    )}
                    {trade.status === 'completed' && reviewedTrades.has(trade.id) && (
                      <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-lg text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                          check_circle
                        </span>
                        Reviewed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedTradeForReview(null);
        }}
        trade={selectedTradeForReview}
        reviewee={selectedTradeForReview ? getReviewee(selectedTradeForReview) : null}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
