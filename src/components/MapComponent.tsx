import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange, calculateTotalDinnerBreakdown } from '../utils/bookingCalculator';
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

    const map = L.map(mapContainerRef.current, {
      center: [35.6762, 139.7550],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Ensure map tiles properly load and resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    restaurants.forEach((restaurant) => {
      const avail = calculateAvailability(restaurant, travelWindow);
      const is3Star = restaurant.stars === 3;
      const is2Star = restaurant.stars === 2;
      const is1Star = restaurant.stars === 1;

      const starLabel = is3Star ? '3★' : is2Star ? '2★' : is1Star ? '1★' : 'Bib';
      const bgColor = is3Star
        ? 'background:#b45309;color:#fff;'
        : is2Star
        ? 'background:#991b1b;color:#fff;'
        : is1Star
        ? 'background:#3f3f46;color:#fff;'
        : 'background:#065f46;color:#fff;';

      const customIcon = L.divIcon({
        className: 'minimal-marker',
        html: `
          <div style="${bgColor} padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; font-family:monospace; box-shadow:0 1px 3px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.2); white-space:nowrap; cursor:pointer;">
            ${starLabel} ${restaurant.name.split(' ')[0]}
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });

      const marker = L.marker(restaurant.coordinates, { icon: customIcon });
      const breakdown = calculateTotalDinnerBreakdown(restaurant, currency, 2);

      const popupContent = document.createElement('div');
      popupContent.className = 'text-xs p-1 font-sans text-neutral-900';
      popupContent.innerHTML = `
        <div style="font-weight:700; font-size:13px; line-height:1.2;">${restaurant.name}</div>
        <div style="color:#737373; font-size:11px; margin-bottom:6px;">${restaurant.nameJapanese} • ${restaurant.cuisineDisplay}</div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-family:monospace; font-size:11px;">
          <span>Tabelog: <strong>${restaurant.tabelogScore}</strong></span>
          <span>Reddit: <strong>${restaurant.redditRating}</strong></span>
        </div>
        <div style="font-size:11px; color:#525252; margin-bottom:6px;">
          Total (2 adults): <strong>${breakdown.totalDisplay}</strong>
          ${breakdown.hasFee ? `<span style="color:#d97706; font-size:10px; display:block;">(incl. ${breakdown.feeDisplay} concierge fee)</span>` : ''}
        </div>
        <div style="font-size:10px; color:#059669; font-weight:600; margin-bottom:8px;">
          ${avail.badgeText}
        </div>
        <div style="display:flex; gap:4px;">
          <button id="btn-pop-details-${restaurant.id}" style="flex:1; background:#171717; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">
            Details
          </button>
          ${
            restaurant.bookingUrl
              ? `<a href="${restaurant.bookingUrl}" target="_blank" rel="noreferrer" style="background:#f5f5f5; border:1px solid #d4d4d4; color:#171717; padding:4px 8px; border-radius:4px; font-size:11px; text-decoration:none;">
                  Book
                </a>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 240, className: 'minimal-leaflet-popup' });
      marker.on('popupopen', () => {
        onSelectRestaurant(restaurant);
        const btn = document.getElementById(`btn-pop-details-${restaurant.id}`);
        if (btn) btn.onclick = () => onOpenDetails(restaurant);
      });

      marker.addTo(map);
      markersRef.current.set(restaurant.id, marker);
      bounds.extend(restaurant.coordinates);
    });

    if (restaurants.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [restaurants, travelWindow, currency]);

  // Sync selected
  useEffect(() => {
    if (!selectedRestaurant || !mapRef.current) return;
    const marker = markersRef.current.get(selectedRestaurant.id);
    if (marker) {
      mapRef.current.flyTo(selectedRestaurant.coordinates, 15, { duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedRestaurant]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
      <div ref={mapContainerRef} className="w-full h-full" />
      <button
        onClick={() => {
          if (!mapRef.current) return;
          if (restaurants.length > 0) {
            const bounds = L.latLngBounds(restaurants.map((r) => r.coordinates));
            mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
          } else {
            mapRef.current.flyTo([35.6762, 139.7550], 13);
          }
        }}
        className="absolute top-3 left-3 z-[1000] p-1.5 bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-700 rounded text-xs shadow-sm"
        title="Reset map view"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
