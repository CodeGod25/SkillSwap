// Nearby Neighbors List (right sidebar) from Stitch design
import { useState } from 'react';

export default function NearbyNeighborsList({ neighbors = [], onNeighborClick }) {
  const [showMap, setShowMap] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Nearby Neighbors
        </h3>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-sm text-primary hover:text-primary/80 font-semibold"
        >
          {showMap ? 'View List' : 'View Map'}
        </button>
      </div>

      {/* Mini map preview placeholder */}
      {showMap && (
        <div className="relative bg-slate-100 dark:bg-slate-900 rounded-xl h-32 mb-4 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-slate-400">
              map
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {neighbors.length} Active Neighbors
            </p>
          </div>
          <button className="absolute bottom-2 right-2 px-3 py-1.5 bg-primary text-slate-900 text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
            View on Map
          </button>
        </div>
      )}

      {/* Neighbors list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {neighbors.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">
              groups
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              No neighbors found nearby
            </p>
          </div>
        ) : (
          neighbors.map((neighbor) => (
            <div
              key={neighbor.id}
              onClick={() => onNeighborClick && onNeighborClick(neighbor)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-transparent hover:border-primary/20"
            >
              {/* Avatar with initials */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: neighbor.color || '#A3E635' }}
              >
                {neighbor.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {neighbor.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {neighbor.distance ? `${neighbor.distance}m away` : 'Nearby'} • {neighbor.skill || neighbor.skills?.[0]?.name || 'Helper'}
                </p>
              </div>

              {/* Message button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message click
                }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                title="Send message"
              >
                <span className="material-symbols-outlined text-slate-400 text-lg">
                  chat_bubble
                </span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
