import React, { useState } from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange, generateGoogleCalendarUrl } from '../utils/bookingCalculator';
import { 
  X, Bookmark, MapPin, Calendar, Clock, ExternalLink, 
  Copy, Check, MessageSquare
} from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Image */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/60" />

          {/* Close & Bookmark Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur transition shadow-lg"
              title={isSaved ? 'Remove from Itinerary' : 'Save to Itinerary'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur transition shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Michelin Stars & Cuisine Tags */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  restaurant.stars === 3
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold'
                    : restaurant.stars === 2
                    ? 'bg-rose-600'
                    : restaurant.stars === 1
                    ? 'bg-red-700'
                    : 'bg-emerald-600'
                }`}>
                  {restaurant.stars === 'Bib Gourmand'
                    ? '🍽️ Michelin Bib Gourmand'
                    : `${'★'.repeat(restaurant.stars as number)} ${restaurant.stars} Michelin Star${restaurant.stars > 1 ? 's' : ''}`}
                </span>

                {restaurant.greenStar && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg">
                    🌿 Green Star
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-200 backdrop-blur border border-slate-700">
                  {restaurant.cuisineDisplay}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                {restaurant.name}
              </h2>
              <div className="text-sm text-slate-300 font-serif mt-1">
                {restaurant.nameJapanese}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Availability Status Banner */}
          <div className={`p-4 rounded-2xl border ${avail.colorClass}`}>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{avail.badgeText}</h4>
                  {avail.calendarDate && (
                    <a
                      href={generateGoogleCalendarUrl(restaurant, avail.calendarDate)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition text-white border border-white/20"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Add Booking Drop to Google Cal</span>
                    </a>
                  )}
                </div>
                <p className="text-xs mt-1 leading-relaxed">{avail.message}</p>
                {restaurant.bookingRule.tips && (
                  <p className="text-xs mt-1.5 font-medium text-amber-300">
                    💡 Booking Tip: {restaurant.bookingRule.tips}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Three-Column Ratings Matrix (Michelin, Tabelog, Reddit) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Michelin Pillar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                Michelin Guide
              </div>
              <div className="text-xl font-extrabold text-white">
                {restaurant.stars === 'Bib Gourmand' ? 'Bib Gourmand' : `${restaurant.stars} Star${restaurant.stars > 1 ? 's' : ''}`}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Inspectors evaluate quality of ingredients, mastery of flavor, technique, and consistency.
              </div>
            </div>

            {/* Tabelog Pillar */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Tabelog Score
                </span>
                {restaurant.tabelogAward && restaurant.tabelogAward !== 'None' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                    {restaurant.tabelogAward}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-400">
                  {restaurant.tabelogScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {restaurant.tabelogScore >= 4.0 ? 'Globally elite top 0.01% in Japan.' : 'Premier Japanese gourmet rating.'}
              </div>
              <a
                href={restaurant.tabelogUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline mt-2 font-medium"
              >
                <span>View on Tabelog</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Reddit Community Pillar */}
            <div className="bg-orange-950/20 border border-orange-800/40 rounded-2xl p-4">
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
                Reddit Consensus
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-400">
                  {restaurant.redditRating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">★ ({restaurant.redditUpvotePercentage}% upvoted)</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Discussed in {restaurant.redditSubreddits.join(', ')} ({restaurant.redditMentionsCount}+ threads)
              </div>
            </div>
          </div>

          {/* Reddit Quote */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                Reddit Foodie Verdict
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{restaurant.redditQuote}"
              </p>
            </div>
          </div>

          {/* Pricing & Hours Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Price & Menus ({currency})
              </h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Dinner Course:</span>
                <span className="font-bold text-white">
                  {formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency)}
                </span>
              </div>
              {restaurant.price.lunchMin && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Lunch Course:</span>
                  <span className="font-bold text-emerald-400">
                    {formatPriceRange(restaurant.price.lunchMin, restaurant.price.lunchMax, currency)}
                  </span>
                </div>
              )}
              {restaurant.dressCode && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-700/40">
                  <span className="text-slate-400">Dress Code:</span>
                  <span className="text-slate-300">{restaurant.dressCode}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hours & Seating
              </h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Closed Days:</span>
                <span className="text-slate-200 font-medium">{restaurant.closedDays}</span>
              </div>
              {restaurant.dinnerHours && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dinner Hours:</span>
                  <span className="text-slate-200">{restaurant.dinnerHours}</span>
                </div>
              )}
              {restaurant.lunchHours && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Lunch Hours:</span>
                  <span className="text-slate-200">{restaurant.lunchHours}</span>
                </div>
              )}
              {restaurant.seatsCount && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-700/40">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="text-slate-300">{restaurant.seatsCount} seats</span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Culinary Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200"
                >
                  ✨ {h}
                </span>
              ))}
            </div>
          </div>

          {/* Location & Japanese Address for Taxi */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Location & Transit</span>
              </h4>
              <span className="text-xs text-amber-400 font-medium">
                {restaurant.nearestStation}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              <span className="text-slate-400 block mb-0.5">English Address:</span>
              <span>{restaurant.address}</span>
            </div>

            {/* Japanese Address Box for Taxi */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Show to Taxi Driver (タクシー用住所)
                </span>
                <span className="text-sm font-serif text-white block mt-0.5">
                  {restaurant.addressJapanese}
                </span>
              </div>
              <button
                onClick={handleCopyJapaneseAddress}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            Booking Engine: <strong className="text-white">{restaurant.bookingPlatform}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Close
            </button>
            {restaurant.bookingUrl ? (
              <a
                href={restaurant.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/50 transition"
              >
                <span>Reserve on {restaurant.bookingPlatform}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-500 cursor-not-allowed"
              >
                Walk-in Only
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
