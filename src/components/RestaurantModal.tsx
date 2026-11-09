import React, { useState } from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange } from '../utils/bookingCalculator';
import { X, Bookmark, ExternalLink, Copy, Check } from 'lucide-react';

interface RestaurantModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  travelWindow: TravelWindow | null;
  currency: Currency;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  travelWindow,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !restaurant) return null;

  const avail = calculateAvailability(restaurant, travelWindow);

  const handleCopyJapaneseAddress = () => {
    navigator.clipboard.writeText(restaurant.addressJapanese);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-white leading-tight">
                {restaurant.name}
              </h2>
              <span className="text-xs text-neutral-500 font-serif">
                {restaurant.nameJapanese}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {restaurant.stars === 'Bib Gourmand' ? 'Michelin Bib Gourmand' : `${restaurant.stars} Michelin Star${restaurant.stars > 1 ? 's' : ''}`} • {restaurant.cuisineDisplay} • {restaurant.ward}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSave}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-neutral-200 text-neutral-200' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-neutral-300">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 border border-neutral-800 rounded-lg p-2.5 bg-neutral-950 font-mono text-center">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Tabelog</div>
              <div className="text-sm font-semibold text-neutral-100 mt-0.5">{restaurant.tabelogScore.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Reddit</div>
              <div className="text-sm font-semibold text-neutral-100 mt-0.5">{restaurant.redditRating.toFixed(1)} ★</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Dinner (2 adults)</div>
              <div className="text-xs font-semibold text-neutral-100 mt-0.5 truncate">
                {formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency, 2)}
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="border border-neutral-800 rounded-lg p-3 bg-neutral-950/60 space-y-1">
            <div className="font-semibold text-neutral-200">
              Booking: {avail.badgeText}
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              {avail.message}
            </p>
            {restaurant.bookingRule.tips && (
              <p className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800">
                Tip: {restaurant.bookingRule.tips}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-neutral-400 leading-relaxed text-xs">
            {restaurant.description}
          </p>

          {/* Taxi Address */}
          <div className="border border-neutral-800 rounded-lg p-2.5 bg-neutral-950/40 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                Taxi Address (タクシー用)
              </span>
              <span className="text-xs text-neutral-200 font-serif block mt-0.5">
                {restaurant.addressJapanese}
              </span>
            </div>
            <button
              onClick={handleCopyJapaneseAddress}
              className="p-1.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white shrink-0"
              title="Copy address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
          <a
            href={restaurant.tabelogUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-neutral-400 hover:underline flex items-center gap-1"
          >
            <span>Tabelog page</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {restaurant.bookingUrl ? (
            <a
              href={restaurant.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <span>Book on {restaurant.bookingPlatform}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-neutral-500">Walk-in only</span>
          )}
        </div>
      </div>
    </div>
  );
};
