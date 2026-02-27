import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../../components/stitch/TopNav';
import TradeRequestModal from '../../components/stitch/TradeRequestModal';
import api from '../../lib/api';

export default function UserProfile() {
  const router = useRouter();
  const { userId } = router.query;
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedType, setSelectedType] = useState('credit');

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      const current = await api.getMe();
      setCurrentUser(current);

      // Fetch the profile user's data
      const response = await fetch(`${api.API_BASE}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await response.json();
      setProfileUser(profile);

      // Fetch reviews for this user
      const reviewsResponse = await fetch(`${api.API_BASE}/reviews/${userId}`, {
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        }
      });

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
        setReviewStats(reviewsData.stats || null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Could not load user profile');
      router.push('/townsquare');
    } finally {
      setLoading(false);
    }
  };

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
      beginner: { emoji: '🌱', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
      intermediate: { emoji: '📚', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      advanced: { emoji: '🎯', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      expert: { emoji: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    };
    return badges[level] || badges.beginner;
  };

  const handleRequestService = (skill, type) => {
    setSelectedSkill(skill);
    setSelectedType(type);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  const offeredSkills = profileUser.skills?.filter(s => s.kind === 'offer') || [];
  const neededSkills = profileUser.skills?.filter(s => s.kind === 'need') || [];
  const primarySkill = offeredSkills[0];

  return (
    <>
      <Head>
        <title>{profileUser.name} - SkillSwap Profile</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={currentUser} />

        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-6 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>

          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full ${primarySkill ? getSkillColor(primarySkill.name) : 'bg-primary'} flex items-center justify-center text-white font-bold text-3xl flex-shrink-0`}>
                {profileUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {profileUser.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500 text-xl">star</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {profileUser.rating > 0 ? profileUser.rating.toFixed(1) : 'New'}
                    </span>
                  </div>

                  {/* Trades */}
                  {profileUser.totalHelps > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <span className="material-symbols-outlined text-sm">handshake</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {profileUser.totalHelps} {profileUser.totalHelps === 1 ? 'trade' : 'trades'}
                      </span>
                    </div>
                  )}

                  {/* Verified Skills Count */}
                  {offeredSkills.filter(s => s.isVerified).length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <span className="material-symbols-outlined text-sm text-blue-700 dark:text-blue-300">verified</span>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {offeredSkills.filter(s => s.isVerified).length} verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {profileUser.lat && profileUser.lng && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm">
                      {profileUser.distance ? `${profileUser.distance.toFixed(1)}km away` : 'Location available'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => router.push(`/messages?userId=${profileUser.id}`)}
                  className="px-6 py-3 bg-primary text-slate-900 font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Skills Offered */}
          {offeredSkills.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-primary">workspace_premium</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Skills Offered</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offeredSkills.map((skill, idx) => {
                  const badge = getLevelBadge(skill.level);
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-bold text-lg text-slate-900 dark:text-white">
                              {skill.name}
                            </span>
                            {skill.isVerified && (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full"
                                title="Verified skill"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                                Verified
                              </span>
                            )}
                            {skill.verificationStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-semibold rounded-full">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                Pending
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {skill.level && (
                              <span className={`text-xs px-2 py-1 rounded ${badge.bg} ${badge.color} font-semibold`}>
                                {badge.emoji} {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                              </span>
                            )}
                            {skill.yearsOfExp > 0 && (
                              <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold">
                                {skill.yearsOfExp} {skill.yearsOfExp === 1 ? 'year' : 'years'} exp
                              </span>
                            )}
                          </div>

                          {/* Show proof if available */}
                          {skill.proofUrl && (
                            <div className="mt-2">
                              <a
                                href={skill.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>link</span>
                                View Proof
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRequestService(skill, 'credit')}
                          className="flex-1 py-2 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Request
                        </button>
                        <button
                          onClick={() => handleRequestService(skill, 'exchange')}
                          className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          Exchange
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills Needed */}
          {neededSkills.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-2xl text-orange-500">search</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Skills Needed</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {neededSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No Skills Message */}
          {offeredSkills.length === 0 && neededSkills.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 block mb-4">
                person_off
              </span>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                This user hasn't added any skills yet
              </p>
            </div>
          )}

          {/* Reviews Section */}
          {reviewStats && reviewStats.totalReviews > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mt-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-yellow-500">star</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reviews</h2>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">
                    {reviewStats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`material-symbols-outlined text-xl ${star <= Math.round(reviewStats.averageRating) ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-700'}`}>
                        star
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviewStats.ratingDistribution[rating] || 0;
                    const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400 w-8">{rating} ⭐</span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {review.reviewer.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-700'}`}>
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                        {review.comment}
                      </p>
                    )}
                    {review.trade && (
                      <div className="text-xs text-slate-500 mt-2">
                        Service: {review.trade.skill}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {reviews.length > 5 && (
                <div className="text-center mt-4">
                  <span className="text-sm text-slate-500">
                    Showing 5 of {reviews.length} reviews
                  </span>
                </div>
              )}
            </div>
          )}

          {/* No Reviews Message */}
          {reviewStats && reviewStats.totalReviews === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mt-6 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 block mb-2">
                star_border
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No reviews yet
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Trade Request Modal */}
      <TradeRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        provider={profileUser}
        skill={selectedSkill}
        type={selectedType}
        user={currentUser}
      />
    </>
  );
}
