// from stitch-export: Map view with markers (see 1.html)
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMapEvents } from 'react-leaflet';

// Component to capture map instance
function MapInstanceCapture({ setMapInstance }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);
  
  return null;
}

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

// Create custom divIcon for user markers with enhanced styling
const createUserIcon = (marker, isHighlighted = false) => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  const initials = marker.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  const colorClass = marker.color || 'bg-primary';
  
  // Map Tailwind colors to hex for inline styles
  const colorMap = {
    'bg-green-500': '#22c55e',
    'bg-orange-500': '#f97316',
    'bg-blue-500': '#3b82f6',
    'bg-purple-500': '#a855f7',
    'bg-primary': '#A3E635',
    'bg-red-500': '#ef4444',
    'bg-pink-500': '#ec4899',
    'bg-cyan-500': '#06b6d4',
    'bg-indigo-500': '#6366f1',
  };
  
  const bgColor = colorMap[colorClass] || colorMap['bg-primary'];
  const scale = isHighlighted ? 1.3 : 1;
  const pulseAnimation = isHighlighted ? 'animation: pulse 1.5s ease-in-out infinite;' : '';
  
  const iconHtml = `
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(${scale}); opacity: 1; }
        50% { transform: scale(${scale * 1.1}); opacity: 0.9; }
      }
    </style>
    <div style="
      width: ${isHighlighted ? '56px' : '48px'};
      height: ${isHighlighted ? '56px' : '48px'};
      border-radius: 50%;
      background: ${bgColor};
      border: ${isHighlighted ? '4px' : '3px'} solid white;
      box-shadow: 0 ${isHighlighted ? '6px' : '4px'} ${isHighlighted ? '16px' : '12px'} rgba(0,0,0,${isHighlighted ? '0.35' : '0.25'}), 
                  0 0 0 ${isHighlighted ? '2px' : '1px'} rgba(0,0,0,0.1),
                  ${isHighlighted ? '0 0 20px 5px ' + bgColor + '40' : ''};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: ${isHighlighted ? '18px' : '16px'};
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      ${pulseAnimation}
    ">
      ${initials}
      ${marker.rating >= 4.8 ? `<div style="position: absolute; top: -4px; right: -4px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; width: ${isHighlighted ? '20px' : '18px'}; height: ${isHighlighted ? '20px' : '18px'}; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">⭐</div>` : ''}
      ${marker.availableNow ? `<div style="position: absolute; bottom: -2px; right: -2px; background: #22c55e; border-radius: 50%; width: ${isHighlighted ? '14px' : '12px'}; height: ${isHighlighted ? '14px' : '12px'}; border: 2px solid white; box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);"></div>` : ''}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [isHighlighted ? 56 : 48, isHighlighted ? 56 : 48],
    iconAnchor: [isHighlighted ? 28 : 24, isHighlighted ? 56 : 48],
    popupAnchor: [0, isHighlighted ? -56 : -48],
  });
};

// Create home icon for user's location
const createHomeIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  const iconHtml = `
    <div style="
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #A3E635 0%, #84cc16 100%);
      border: 4px solid white;
      box-shadow: 0 6px 20px rgba(163, 230, 53, 0.4), 0 0 0 2px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e293b;
      position: relative;
      animation: homeGlow 2s ease-in-out infinite;
    ">
      <style>
        @keyframes homeGlow {
          0%, 100% { box-shadow: 0 6px 20px rgba(163, 230, 53, 0.4), 0 0 0 2px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 6px 20px rgba(163, 230, 53, 0.6), 0 0 0 2px rgba(0,0,0,0.1), 0 0 30px 8px rgba(163, 230, 53, 0.3); }
        }
      </style>
      <span style="font-size: 30px; font-weight: bold;">🏠</span>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'home-marker-icon',
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60],
  });
};

export default function MapView({ 
  markers = [], 
  center = DEFAULT_CENTER, 
  onMarkerClick,
  onFilterHighlyRated,
  onFilterAvailableNow,
  searchRadius = 5 // in km
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState(center);
  const [highlyRatedActive, setHighlyRatedActive] = useState(false);
  const [availableNowActive, setAvailableNowActive] = useState(false);
  const [map, setMap] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [showNeighborsPanel, setShowNeighborsPanel] = useState(true);

  // Calculate rating for each user (simulated based on balance and skills)
  const enhancedMarkers = markers.map(marker => ({
    ...marker,
    rating: Math.min(5.0, 4.0 + (marker.balance || 0) * 0.15 + (marker.skills?.length || 0) * 0.1),
    availableNow: Math.random() > 0.3, // 70% chance of being available
  }));

  // Apply filters
  const filteredMarkers = enhancedMarkers.filter(marker => {
    // Filter by distance from user location (using searchRadius)
    if (userLocation && marker.lat && marker.lng) {
      const distanceKm = marker.distance || calculateDistance(
        userLocation[0] || userLocation.lat,
        userLocation[1] || userLocation.lng,
        marker.lat,
        marker.lng
      );
      if (distanceKm > searchRadius) return false;
    }
    
    if (highlyRatedActive && marker.rating < 4.5) return false;
    if (availableNowActive && !marker.availableNow) return false;
    return true;
  });

  // Helper function to calculate distance between two points (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Sort by distance - nearest first
  const sortedMarkers = [...filteredMarkers].sort((a, b) => {
    const distA = a.distance || 0;
    const distB = b.distance || 0;
    return distA - distB;
  });

  // Get top 5 closest neighbors for panel
  const closestNeighbors = sortedMarkers.slice(0, 5);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (center) {
      setUserLocation(center);
    }
  }, [center]);

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  const handleCenterUser = () => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          if (map) {
            map.setView([lat, lng], 14);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleFilterHighlyRated = () => {
    const newState = !highlyRatedActive;
    setHighlyRatedActive(newState);
    if (onFilterHighlyRated) {
      onFilterHighlyRated(newState);
    }
  };

  const handleFilterAvailableNow = () => {
    const newState = !availableNowActive;
    setAvailableNowActive(newState);
    if (onFilterAvailableNow) {
      onFilterAvailableNow(newState);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <p className="text-slate-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-tl-3xl"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <MapInstanceCapture setMapInstance={setMap} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {/* Search radius circle */}
        {userLocation && (
          <Circle
            center={[userLocation[0] || userLocation.lat, userLocation[1] || userLocation.lng]}
            radius={searchRadius * 1000} // Convert km to meters
            pathOptions={{
              fillColor: '#A3E635',
              fillOpacity: 0.1,
              color: '#A3E635',
              weight: 2,
              opacity: 0.5,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* User's home location marker */}
        {userLocation && (
          <Marker
            position={[userLocation[0] || userLocation.lat, userLocation[1] || userLocation.lng]}
            icon={createHomeIcon()}
          >
            <Popup>
              <div className="p-2 text-center">
                <p className="font-bold text-slate-900">Your Location</p>
                <p className="text-xs text-slate-600 mt-1">
                  Searching within {searchRadius}km
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createUserIcon(marker, hoveredMarkerId === marker.id)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(marker);
              },
              mouseover: () => setHoveredMarkerId(marker.id),
              mouseout: () => setHoveredMarkerId(null),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-[220px]">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: marker.color?.replace('bg-', '#') || '#A3E635' }}
                  >
                    {marker.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-slate-900">{marker.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-semibold text-slate-700">{marker.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-500 ml-1">
                        ({marker.skills?.length || 0} skills)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    {marker.skill || marker.skills?.[0]?.name || 'Available for help'}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {marker.distance?.toFixed(1) || '0.5'}km away
                    </span>
                    <span className="text-slate-600 font-medium">
                      {marker.creditsPerHour || 1} credit/hr
                    </span>
                  </div>
                  {marker.availableNow && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Available Now
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Closest Neighbors Panel */}
      {showNeighborsPanel && closestNeighbors.length > 0 && (
        <div className="absolute top-20 left-4 z-[1000] w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-primary/10">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">place</span>
              Closest Neighbors
            </h3>
            <button
              onClick={() => setShowNeighborsPanel(false)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {closestNeighbors.map((neighbor, idx) => (
              <div
                key={neighbor.id}
                className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => {
                  setHoveredMarkerId(neighbor.id);
                  if (onMarkerClick) onMarkerClick(neighbor);
                  if (map) {
                    map.setView([neighbor.lat, neighbor.lng], 15);
                  }
                }}
                onMouseEnter={() => setHoveredMarkerId(neighbor.id)}
                onMouseLeave={() => setHoveredMarkerId(null)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {neighbor.name}
                  </span>
                  {neighbor.rating >= 4.8 && (
                    <span className="text-yellow-500 text-xs">⭐</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                    {neighbor.skills?.[0]?.name || 'Helper'}
                  </span>
                  <span className="text-primary font-semibold ml-2">
                    {neighbor.distance?.toFixed(1)}km
                  </span>
                </div>
                {neighbor.availableNow && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Available
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {filteredMarkers.length} total within {searchRadius}km
            </p>
          </div>
        </div>
      )}

      {/* Toggle neighbors panel button when hidden */}
      {!showNeighborsPanel && closestNeighbors.length > 0 && (
        <button
          onClick={() => setShowNeighborsPanel(true)}
          className="absolute top-20 left-4 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 rounded-xl shadow-xl hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700"
          title="Show Nearest Neighbors"
        >
          <span className="material-symbols-outlined text-primary">people</span>
        </button>
      )}

      {/* Map controls overlay (from design) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button 
          onClick={handleZoomIn}
          className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 border border-slate-200 dark:border-slate-700"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
            add
          </span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 border border-slate-200 dark:border-slate-700"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
            remove
          </span>
        </button>
        <button 
          onClick={handleCenterUser}
          className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 border border-slate-200 dark:border-slate-700"
          title="My Location"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">
            my_location
          </span>
        </button>
      </div>

      {/* Filters overlay (from design) */}
      <div className="absolute top-4 left-4 flex gap-2 z-[1000]">
        <button 
          onClick={handleFilterHighlyRated}
          className={`px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 transition-all border ${
            highlyRatedActive 
              ? 'bg-primary text-slate-900 border-primary shadow-primary/30' 
              : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${highlyRatedActive ? 'text-slate-900' : 'text-primary'}`}>
            filter_list
          </span>
          Highly Rated
          {highlyRatedActive && (
            <span className="ml-1 bg-slate-900/20 rounded-full px-2 py-0.5 text-xs">
              {filteredMarkers.length}
            </span>
          )}
        </button>
        <button 
          onClick={handleFilterAvailableNow}
          className={`px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 transition-all border ${
            availableNowActive 
              ? 'bg-primary text-slate-900 border-primary shadow-primary/30' 
              : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${availableNowActive ? 'text-slate-900' : 'text-green-500'}`}>schedule</span>
          Available Now
          {availableNowActive && (
            <span className="ml-1 bg-slate-900/20 rounded-full px-2 py-0.5 text-xs">
              {filteredMarkers.length}
            </span>
          )}
        </button>
      </div>

      {/* Status overlay when no markers */}
      {filteredMarkers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-3 block">
                explore
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No nearby users found
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Try increasing your search radius or adjusting filters
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
