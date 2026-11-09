import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange } from '../utils/bookingCalculator';
import { RotateCcw } from 'lucide-react';

interface MapComponentProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (r: Restaurant) => void;
  onOpenDetails: (r: Restaurant) => void;
  travelWindow: TravelWindow | null;
  currency: Currency;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onOpenDetails,
  travelWindow,
  currency,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Central Tokyo (Imperial Palace / Ginza / Marunouchi nexus)
    const map = L.map(mapContainerRef.current, {
      center: [35.6762, 139.7550],
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark & Sleek CartoDB Positron / Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when restaurants list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    restaurants.forEach((restaurant) => {
      const avail = calculateAvailability(restaurant, travelWindow);
      
      // Determine marker color and icon
      let badgeHtml = '';
      let markerBg = 'bg-red-600';
      let borderGlow = 'border-red-400';

      if (restaurant.stars === 3) {
        markerBg = 'bg-gradient-to-br from-amber-500 to-yellow-600';
        borderGlow = 'border-amber-300 ring-4 ring-amber-500/30';
        badgeHtml = '⭐⭐⭐';
      } else if (restaurant.stars === 2) {
        markerBg = 'bg-gradient-to-br from-red-600 to-rose-700';
        borderGlow = 'border-rose-400 ring-2 ring-rose-500/30';
        badgeHtml = '⭐⭐';
      } else if (restaurant.stars === 1) {
        markerBg = 'bg-gradient-to-br from-red-700 to-red-900';
        borderGlow = 'border-red-500';
        badgeHtml = '⭐';
      } else {
        // Bib Gourmand
        markerBg = 'bg-gradient-to-br from-emerald-600 to-teal-700';
        borderGlow = 'border-emerald-400';
        badgeHtml = '🍽️';
      }

      const customIcon = L.divIcon({
        className: 'custom-michelin-marker',
        html: `
          <div class="relative group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125">
            <div class="${markerBg} ${borderGlow} border-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xl flex items-center justify-center gap-1 whitespace-nowrap">
              <span>${badgeHtml}</span>
              <span class="text-[11px] font-semibold">${restaurant.name.split(' ')[0]}</span>
            </div>
            <div class="w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45 mx-auto -mt-1"></div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const marker = L.marker(restaurant.coordinates, { icon: customIcon });

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-900 font-sans max-w-[260px]';
      popupContent.innerHTML = `
        <div class="rounded-lg overflow-hidden mb-2 relative">
          <img src="${restaurant.coverImage}" alt="${restaurant.name}" class="w-full h-28 object-cover rounded-md" />
          <div class="absolute top-2 left-2 bg-slate-900/90 text-amber-400 px-2 py-0.5 rounded text-xs font-bold">
            ${restaurant.stars === 'Bib Gourmand' ? '🍽️ Bib Gourmand' : `${'★'.repeat(restaurant.stars as number)} ${restaurant.stars} Star`}
          </div>
        </div>
        <div class="text-sm font-bold text-slate-900 leading-tight">${restaurant.name}</div>
        <div class="text-xs text-slate-500 mb-2">${restaurant.nameJapanese} • ${restaurant.cuisineDisplay}</div>
        
        <div class="grid grid-cols-2 gap-1 mb-2 text-xs">
          <div class="bg-amber-50 border border-amber-200 rounded p-1 text-center">
            <div class="text-[10px] text-amber-800 font-medium">Tabelog</div>
            <div class="font-bold text-amber-600">${restaurant.tabelogScore} ${restaurant.tabelogAward !== 'None' ? `(${restaurant.tabelogAward})` : ''}</div>
          </div>
          <div class="bg-slate-100 rounded p-1 text-center">
            <div class="text-[10px] text-slate-600 font-medium">Dinner Range</div>
            <div class="font-semibold text-slate-800">${formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency)}</div>
          </div>
        </div>

        <div class="text-[11px] mb-2 px-2 py-1 rounded ${avail.colorClass}">
          <strong>${avail.badgeText}</strong>: ${avail.message}
        </div>

        <div class="flex items-center gap-1.5 pt-1">
          <button id="btn-details-${restaurant.id}" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-semibold text-center transition">
            View Details
          </button>
          ${
            restaurant.bookingUrl
              ? `<a href="${restaurant.bookingUrl}" target="_blank" rel="noreferrer" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-medium" title="Direct Booking">
                  <span class="text-xs">🔗 Book</span>
                </a>`
              : ''
          }
        </div>
      `;

      // Attach button listener inside popup
      marker.bindPopup(popupContent, { maxWidth: 280, className: 'custom-leaflet-popup' });
      marker.on('popupopen', () => {
        onSelectRestaurant(restaurant);
        const btn = document.getElementById(`btn-details-${restaurant.id}`);
        if (btn) {
          btn.onclick = () => onOpenDetails(restaurant);
        }
      });

      marker.addTo(map);
      markersRef.current.set(restaurant.id, marker);
      bounds.extend(restaurant.coordinates);
    });

    // Auto-fit bounds if we have restaurants
    if (restaurants.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [restaurants, travelWindow, currency]);

  // Handle selectedRestaurant changes (fly to marker)
  useEffect(() => {
    if (!selectedRestaurant || !mapRef.current) return;
    const marker = markersRef.current.get(selectedRestaurant.id);
    if (marker) {
      mapRef.current.flyTo(selectedRestaurant.coordinates, 15, { duration: 1.2 });
      marker.openPopup();
    }
  }, [selectedRestaurant]);

  const handleResetCenter = () => {
    if (!mapRef.current) return;
    if (restaurants.length > 0) {
      const bounds = L.latLngBounds(restaurants.map((r) => r.coordinates));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      mapRef.current.flyTo([35.6762, 139.7550], 13);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleResetCenter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold shadow-lg backdrop-blur transition"
          title="Reset Map View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset View</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] shadow-xl backdrop-blur text-slate-300 space-y-1">
        <div className="font-semibold text-white mb-1">Tokyo Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span>⭐⭐⭐ 3 Michelin Stars</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
          <span>⭐⭐ 2 Michelin Stars</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-800 inline-block"></span>
          <span>⭐ 1 Michelin Star</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>🍽️ Bib Gourmand (High Value)</span>
        </div>
      </div>
    </div>
  );
};
