import React from 'react';
import { Restaurant, TravelWindow, Currency } from '../types';
import { calculateAvailability, formatPrice } from '../utils/bookingCalculator';
import { Star, Award, DollarSign, CalendarCheck } from 'lucide-react';

interface StatsOverviewProps {
  restaurants: Restaurant[];
  travelWindow: TravelWindow | null;
  currency: Currency;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  restaurants,
  travelWindow,
  currency,
}) => {
  const threeStarCount = restaurants.filter((r) => r.stars === 3).length;
  const eliteTabelogCount = restaurants.filter((r) => r.tabelogScore >= 4.0).length;
  
  let openCount = 0;
  restaurants.forEach((r) => {
    const avail = calculateAvailability(r, travelWindow);
    if (avail.canBookNow) openCount++;
  });

  const avgDinner = Math.round(
    restaurants.reduce((acc, r) => acc + (r.price.dinnerMin + r.price.dinnerMax) / 2, 0) /
      (restaurants.length || 1)
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Star className="w-4 h-4 fill-amber-400" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white leading-tight">
            {threeStarCount}
          </div>
          <div className="text-[11px] text-slate-400">3-Star Icons</div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white leading-tight">
            {eliteTabelogCount}
          </div>
          <div className="text-[11px] text-slate-400">Tabelog ≥ 4.00</div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <CalendarCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-emerald-400 leading-tight">
            {openCount} / {restaurants.length}
          </div>
          <div className="text-[11px] text-slate-400">Bookable Now</div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white leading-tight">
            ~{formatPrice(avgDinner, currency)}
          </div>
          <div className="text-[11px] text-slate-400">Avg Dinner Course</div>
        </div>
      </div>
    </div>
  );
};
