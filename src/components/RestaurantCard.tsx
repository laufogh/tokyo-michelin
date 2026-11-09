import React from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange } from '../utils/bookingCalculator';
import { Bookmark, MapPin, Clock, ExternalLink, ChevronRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  travelWindow: TravelWindow | null;
  currency: Currency;
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
}) => {
  const avail = calculateAvailability(restaurant, travelWindow);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-slate-800/90 rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-red-500 shadow-xl ring-2 ring-red-500/30'
          : 'border-slate-700/80 hover:border-slate-600 hover:shadow-lg'
      }`}
    >
      <div>
        {/* Cover Image & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

          {/* Michelin Stars Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md flex items-center gap-1 ${
              restaurant.stars === 3
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold'
                : restaurant.stars === 2
                ? 'bg-rose-600'
                : restaurant.stars === 1
                ? 'bg-red-700'
                : 'bg-emerald-600'
            }`}>
              {restaurant.stars === 'Bib Gourmand' ? (
                <>🍽️ <span>Bib Gourmand</span></>
              ) : (
                <>
                  <span className="tracking-widest">{'★'.repeat(restaurant.stars as number)}</span>
                  <span>{restaurant.stars} Star{restaurant.stars > 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            {restaurant.greenStar && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md" title="Michelin Green Star for Sustainable Gastronomy">
                🌿 Green
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md"
            title={isSaved ? 'Remove from Itinerary' : 'Save to Itinerary'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
          </button>

          {/* Ward & Station Tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm">
              <MapPin className="w-3 h-3 text-red-400" />
              <span>{restaurant.ward}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[11px]">
              {restaurant.cuisineDisplay}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Titles */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-red-400 transition leading-tight">
                {restaurant.name}
              </h3>
              <span className="text-xs text-slate-400 font-serif shrink-0">
                {restaurant.nameJapanese}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {restaurant.description}
            </p>
          </div>

          {/* Ratings Grid: Tabelog & Reddit */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Tabelog Card */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Tabelog
                </span>
                {restaurant.tabelogAward && restaurant.tabelogAward !== 'None' && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    restaurant.tabelogAward === 'Gold'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : restaurant.tabelogAward === 'Silver'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : restaurant.tabelogAward === 'Bronze'
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-amber-900/70 text-amber-200'
                  }`}>
                    {restaurant.tabelogAward}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-extrabold text-amber-400">
                  {restaurant.tabelogScore.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>

            {/* Reddit Card */}
            <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                  Reddit Score
                </span>
                <span className="text-[10px] text-slate-400">
                  {restaurant.redditMentionsCount}+ posts
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-extrabold text-orange-400">
                  {restaurant.redditRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">★ ({restaurant.redditUpvotePercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-slate-900/70 rounded-xl p-2.5 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Dinner Course</span>
              <span className="text-slate-200 font-semibold">
                {formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency)}
              </span>
            </div>
            {restaurant.price.lunchMin ? (
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Lunch Option</span>
                <span className="text-emerald-400 font-medium">
                  {formatPriceRange(restaurant.price.lunchMin, restaurant.price.lunchMax, currency)}
                </span>
              </div>
            ) : (
              <div className="text-right text-[10px] text-slate-500 italic">
                Dinner Only
              </div>
            )}
          </div>

          {/* Reddit Quote snippet */}
          <div className="text-[11px] text-slate-400 italic bg-slate-900/40 border-l-2 border-orange-500/60 pl-2 py-0.5 line-clamp-2">
            "{restaurant.redditQuote}"
          </div>
        </div>
      </div>

      {/* Footer: Availability & Action Button */}
      <div className="p-4 pt-0 space-y-2">
        {/* Availability Badge */}
        <div className={`p-2 rounded-xl border text-xs flex items-start gap-2 ${avail.colorClass}`}>
          <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div className="flex-1 leading-tight">
            <span className="font-bold block">{avail.badgeText}</span>
            <span className="text-[11px] opacity-90 block mt-0.5">{avail.message}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-700/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            <span>Overview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {restaurant.bookingUrl && (
            <a
              href={restaurant.bookingUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
              title={`Book on ${restaurant.bookingPlatform}`}
            >
              <span>{restaurant.bookingPlatform}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
