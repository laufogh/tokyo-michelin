import React from 'react';
import { TravelWindow } from '../types';
import { Calendar, X, CheckCircle, Sparkles } from 'lucide-react';

interface TripDateSelectorProps {
  travelWindow: TravelWindow | null;
  onUpdateTravelWindow: (window: TravelWindow | null) => void;
  onlyBookable: boolean;
  onToggleOnlyBookable: (val: boolean) => void;
  openCount: number;
}

export const TripDateSelector: React.FC<TripDateSelectorProps> = ({
  travelWindow,
  onUpdateTravelWindow,
  onlyBookable,
  onToggleOnlyBookable,
  openCount,
}) => {
  const startDate = travelWindow?.startDate || '';
  const endDate = travelWindow?.endDate || '';
  const partySize = travelWindow?.partySize || 2;
  const mealType = travelWindow?.mealType || 'any';

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdateTravelWindow({
      startDate: val,
      endDate: endDate && endDate >= val ? endDate : val,
      partySize,
      mealType,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdateTravelWindow({
      startDate: startDate || val,
      endDate: val,
      partySize,
      mealType,
    });
  };

  const handlePartySizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateTravelWindow({
      startDate,
      endDate,
      partySize: Number(e.target.value),
      mealType,
    });
  };

  const handleClear = () => {
    onUpdateTravelWindow(null);
  };

  const setPreset = (daysFromNow: number, durationDays: number) => {
    const now = new Date();
    const start = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    onUpdateTravelWindow({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      partySize,
      mealType,
    });
  };

  const isActive = Boolean(startDate);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Section Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Tokyo Trip Travel Window
              </h2>
              {isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" /> Active Filter
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plug in your Tokyo travel dates to instantly calculate booking window release dates, open slots, and waitlists.
            </p>
          </div>
        </div>

        {/* Right: Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-500 font-medium">Quick Pick:</span>
          <button
            onClick={() => setPreset(14, 7)}
            className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            In 2 Weeks
          </button>
          <button
            onClick={() => setPreset(35, 7)}
            className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            Next Month
          </button>
          <button
            onClick={() => setPreset(75, 10)}
            className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            In 2.5 Months
          </button>
          {isActive && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Trip Arrival Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Trip Departure Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={handleEndDateChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>
        </div>

        {/* Party Size */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Party Size
          </label>
          <div className="relative">
            <select
              value={partySize}
              onChange={handlePartySizeChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            >
              <option value={1}>1 Person (Solo diner)</option>
              <option value={2}>2 People (Standard counter)</option>
              <option value={3}>3 People</option>
              <option value={4}>4 People (Table / Private Room)</option>
              <option value={6}>5-6 People (Full Counter / Room)</option>
            </select>
          </div>
        </div>

        {/* Filter Toggle: Bookable Now */}
        <div className="flex flex-col justify-end">
          <label
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
              onlyBookable
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${onlyBookable ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="text-xs font-semibold block leading-tight">
                  Only Bookable Now
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  {isActive ? `${openCount} restaurants open` : 'Window currently active'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={onlyBookable}
              onChange={(e) => onToggleOnlyBookable(e.target.value === 'true' || e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-600 focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Helpful Status Banner when dates are chosen */}
      {isActive && (
        <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Evaluating availability for <strong className="text-white">{startDate}</strong> to <strong className="text-white">{endDate}</strong> ({partySize} diners)
            </span>
          </div>
          <span className="text-slate-400">
            Booking dates adapt automatically to each restaurant’s release schedule (e.g. 1st of month, 30-day, or 60-day rolling).
          </span>
        </div>
      )}
    </div>
  );
};
