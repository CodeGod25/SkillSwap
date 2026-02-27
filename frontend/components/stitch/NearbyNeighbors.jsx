// Nearby Neighbors panel component (from Stitch design)
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function NearbyNeighbors({ neighbors = [], totalCount = 0, searchRadius = 5, userLocation = {} }) {
  const router = useRouter();
  const [selectedNeighbor, setSelectedNeighbor] = useState(null);
  const [showExpandedMap, setShowExpandedMap] = useState(false);

  useEffect(() => {
    console.log('NearbyNeighbors received:', { neighbors, totalCount, neighborsLength: neighbors?.length });
  }, [neighbors, totalCount]);

  // Get the first 3 neighbors to display
  const displayedNeighbors = neighbors.slice(0, 3);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const getColorClass = (skills) => {
    const primarySkill = skills?.[0]?.name?.toLowerCase() || '';
    
    if (primarySkill.includes('garden') || primarySkill.includes('plant') || primarySkill.includes('landscap')) {
      return 'bg-green-500';
    } else if (primarySkill.includes('cook') || primarySkill.includes('baking') || primarySkill.includes('chef')) {
      return 'bg-orange-500';
    } else if (primarySkill.includes('teach') || primarySkill.includes('tutor') || primarySkill.includes('python') || primarySkill.includes('spanish') || primarySkill.includes('education') || primarySkill.includes('programming') || primarySkill.includes('language')) {
      return 'bg-blue-500';
    } else if (primarySkill.includes('repair') || primarySkill.includes('plumb') || primarySkill.includes('carpent') || primarySkill.includes('home') || primarySkill.includes('handyman')) {
      return 'bg-purple-500';
    } else if (primarySkill.includes('music') || primarySkill.includes('piano') || primarySkill.includes('guitar') || primarySkill.includes('lesson')) {
      return 'bg-pink-500';
    } else if (primarySkill.includes('pet') || primarySkill.includes('dog') || primarySkill.includes('cat') || primarySkill.includes('animal')) {
      return 'bg-cyan-500';
    } else if (primarySkill.includes('fitness') || primarySkill.includes('yoga') || primarySkill.includes('train') || primarySkill.includes('exercise')) {
      return 'bg-red-500';
    } else if (primarySkill.includes('photo') || primarySkill.includes('design') || primarySkill.includes('art') || primarySkill.includes('creative')) {
      return 'bg-indigo-500';
    }
    return 'bg-primary';
  };

  const getSkillsText = (skills) => {
    return skills?.map(s => s.name).join(' • ') || 'Available';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Nearby Neighbors
        </h3>
        <button
          onClick={() => setShowExpandedMap(true)}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">open_in_full</span>
          Expand Map
        </button>
      </div>

      {/* Mini map with count */}
      <div className="relative h-36 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 overflow-hidden">
        {/* Placeholder map pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-600"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Active neighbors badge */}
        <div className="absolute top-3 left-3 bg-white dark:bg-slate-900 rounded-full px-4 py-2 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {totalCount} Active Neighbor{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Map center indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-900 text-sm">my_location</span>
          </div>
        </div>

        {/* Scatter some dots representing neighbors - NOW CLICKABLE */}
        {displayedNeighbors.slice(0, 5).map((neighbor, i) => {
          const positions = [
            { top: '30%', left: '25%' },
            { top: '65%', left: '40%' },
            { top: '45%', left: '70%' },
            { top: '20%', left: '60%' },
            { top: '70%', left: '25%' },
          ];
          return (
            <button
              key={neighbor.id}
              onClick={() => setSelectedNeighbor(neighbor)}
              className={`absolute w-4 h-4 ${getColorClass(neighbor.skills)} rounded-full border-2 border-white shadow-md hover:scale-150 hover:z-10 transition-transform cursor-pointer`}
              style={positions[i]}
              title={`Click to view ${neighbor.name}`}
            />
          );
        })}

        {/* Tooltip for selected neighbor */}
        {selectedNeighbor && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-56">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
              <button
                onClick={() => setSelectedNeighbor(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full ${getColorClass(selectedNeighbor.skills)} flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(selectedNeighbor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {selectedNeighbor.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {formatDistance(selectedNeighbor.distance || 0)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Skills:</p>
                <p className="text-xs text-slate-900 dark:text-white">
                  {getSkillsText(selectedNeighbor.skills)}
                </p>
              </div>
              <button
                onClick={() => router.push(`/dashboard?user=${selectedNeighbor.id}`)}
                className="w-full mt-3 py-2 bg-primary text-slate-900 font-semibold rounded-lg hover:bg-primary/90 transition-colors text-xs"
              >
                View Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View List button - now shows neighbor count and navigates with distance */}
      {totalCount > 0 ? (
        <button
          onClick={() => router.push(`/community?distance=${searchRadius}`)}
          className="w-full py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">list</span>
          View All {totalCount} Neighbor{totalCount !== 1 ? 's' : ''} →
        </button>
      ) : (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2 block">person_search</span>
          <p className="text-sm">No nearby neighbors yet</p>
          <p className="text-xs mt-2">Try expanding your search radius or add your location in Profile</p>
        </div>
      )}

      {/* Expanded Map Modal */}
      {showExpandedMap && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Neighborhood Map
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {totalCount} neighbors within {searchRadius}km
                </p>
              </div>
              <button
                onClick={() => setShowExpandedMap(false)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-slate-900 dark:text-white">close</span>
              </button>
            </div>

            {/* Map Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden">
                {/* Large map with street view placeholder */}
                <div className="absolute inset-0">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.02},${userLocation.lat - 0.02},${userLocation.lng + 0.02},${userLocation.lat + 0.02}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
                    className="w-full h-full border-0"
                    title="Neighborhood Map"
                  />
                </div>

                {/* Overlay with neighbor markers */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 max-h-48 overflow-y-auto">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">
                    Nearby Neighbors ({neighbors.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {neighbors.map((neighbor) => (
                      <div
                        key={neighbor.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => {
                          setShowExpandedMap(false);
                          router.push(`/dashboard?user=${neighbor.id}`);
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full ${getColorClass(neighbor.skills)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                          {getInitials(neighbor.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {neighbor.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDistance(neighbor.distance || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
