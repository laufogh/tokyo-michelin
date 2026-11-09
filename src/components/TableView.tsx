import React from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPriceRange } from '../utils/bookingCalculator';
import { Bookmark } from 'lucide-react';

interface TableViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (r: Restaurant) => void;
  onOpenDetails: (r: Restaurant) => void;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  travelWindow: TravelWindow | null;
  currency: Currency;
}

export const TableView: React.FC<TableViewProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onOpenDetails,
  savedIds,
  onToggleSave,
  travelWindow,
  currency,
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-3 w-8"></th>
              <th className="py-3 px-3">Restaurant</th>
              <th className="py-3 px-3">Michelin</th>
              <th className="py-3 px-3">Cuisine</th>
              <th className="py-3 px-3">Tabelog</th>
              <th className="py-3 px-3">Reddit</th>
              <th className="py-3 px-3">Price (Dinner)</th>
              <th className="py-3 px-3">Booking Availability</th>
              <th className="py-3 px-3">Platform</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {restaurants.map((restaurant) => {
              const isSelected = selectedRestaurant?.id === restaurant.id;
              const isSaved = savedIds.has(restaurant.id);
              const avail = calculateAvailability(restaurant, travelWindow);

              return (
                <tr
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant)}
                  className={`hover:bg-slate-700/40 cursor-pointer transition ${
                    isSelected ? 'bg-red-950/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(restaurant.id);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white leading-tight">
                      {restaurant.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-serif">
                      {restaurant.nameJapanese} • {restaurant.ward}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {restaurant.stars === 'Bib Gourmand' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                        🍽️ Bib
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        restaurant.stars === 3
                          ? 'bg-amber-500 text-slate-950'
                          : restaurant.stars === 2
                          ? 'bg-rose-600 text-white'
                          : 'bg-red-700 text-white'
                      }`}>
                        {'★'.repeat(restaurant.stars as number)} {restaurant.stars}★
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                    {restaurant.cuisineDisplay}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-extrabold text-amber-400">
                      {restaurant.tabelogScore.toFixed(2)}
                    </span>
                    {restaurant.tabelogAward && restaurant.tabelogAward !== 'None' && (
                      <span className="ml-1 text-[10px] px-1 rounded bg-amber-900/60 text-amber-200">
                        {restaurant.tabelogAward}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-orange-400 font-semibold">
                    {restaurant.redditRating.toFixed(1)} ★
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-200">
                    {formatPriceRange(restaurant.price.dinnerMin, restaurant.price.dinnerMax, currency)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${avail.colorClass}`}>
                      {avail.badgeText}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                    {restaurant.bookingPlatform}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(restaurant);
                      }}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-xs font-semibold transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
