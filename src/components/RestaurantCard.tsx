import React from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange } from '../utils/bookingCalculator';
import { Bookmark, ExternalLink } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  travelWindow: TravelWindow | null;
  currency: Currency;
  isPareto?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isSelected,
  onSelect,
  onOpenDetails,
  isSaved,
  onToggleSave,
  travelWindow,
  currency,
  isPareto,
}) => {
  const avail = calculateAvailability(restaurant, travelWindow);

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
        isSelected
          ? 'bg-neutral-900 border-neutral-500 shadow-sm'
          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
      }`}
    >
      <div>
        {/* Top line: Name & Stars & Bookmark */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-neutral-100 leading-tight">
                {restaurant.name}
              </h3>
              <span className="text-xs text-neutral-500 font-serif">
                {restaurant.nameJapanese}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {restaurant.cuisineDisplay} • {restaurant.ward}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isPareto && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60" title="Pareto Optimal (Optimal Quality for its Price)">
                ⚡ Pareto
              </span>
            )}
            {/* Michelin Star badge */}
            <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">
              {restaurant.stars === 'Bib Gourmand' ? 'Bib' : `${restaurant.stars}★`}
            </span>
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className="p-1 text-neutral-500 hover:text-neutral-200 transition"
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-neutral-200 text-neutral-200' : ''}`} />
            </button>
          </div>
        </div>

        {/* Essential Metrics Line */}
        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400 font-mono">
          <div>
            <span className="text-neutral-500 text-[11px]">Tabelog: </span>
            <span className="text-neutral-200 font-medium">{restaurant.tabelogScore.toFixed(2)}</span>
            {restaurant.tabelogAward && restaurant.tabelogAward !== 'None' && (
              <span className="text-[10px] text-neutral-400 ml-1">({restaurant.tabelogAward})</span>
            )}
          </div>
          <span className="text-neutral-700">•</span>
          <div>
            <span className="text-neutral-500 text-[11px]">Reddit: </span>
            <span className="text-neutral-200 font-medium">{restaurant.redditRating.toFixed(1)}</span>
          </div>
          <span className="text-neutral-700">•</span>
          <div>
            <span className="text-neutral-500 text-[11px]">Dinner (2 adults): </span>
            <span className="text-neutral-200 font-medium">
              {formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency, 2)}
            </span>
          </div>
        </div>
      </div>

        {/* Bottom line: Availability, Language & Actions */}
      <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-neutral-800/80 gap-2">
        {/* Availability & Language */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                avail.status === 'open'
                  ? 'bg-emerald-400'
                  : avail.status === 'walk_in'
                  ? 'bg-sky-400'
                  : avail.status === 'upcoming'
                  ? 'bg-amber-400'
                  : 'bg-neutral-500'
              }`}
            />
            <span className="truncate text-neutral-300 text-[11px]">
              {avail.badgeText}
            </span>
          </div>

          <span className="text-neutral-700">•</span>

          <div className="flex items-center gap-1 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              restaurant.languageAdvisability.startsWith('Welcoming')
                ? 'bg-emerald-400'
                : restaurant.languageAdvisability.startsWith('Friendly')
                ? 'bg-sky-400'
                : 'bg-amber-400'
            }`} />
            <span className="text-neutral-400 truncate">
              {restaurant.languageAdvisability.split(' (')[0]}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="text-[11px] text-neutral-400 hover:text-white transition"
          >
            Details
          </button>
          {restaurant.bookingUrl && (
            <a
              href={restaurant.bookingUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <span>{restaurant.bookingPlatform}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
