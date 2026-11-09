import React from 'react';
import { TravelWindow } from '../types';
import { Calendar, X } from 'lucide-react';

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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdateTravelWindow({
      startDate: val,
      endDate: endDate && endDate >= val ? endDate : val,
      partySize: 2,
      mealType: 'any',
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdateTravelWindow({
      startDate: startDate || val,
      endDate: val,
      partySize: 2,
      mealType: 'any',
    });
  };

  const handleClear = () => {
    onUpdateTravelWindow(null);
    onToggleOnlyBookable(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
      {/* Date Pickers */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-neutral-400 flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>Travel Window:</span>
        </span>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
        />
        <span className="text-neutral-500">to</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={handleEndDateChange}
          className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
        />

        {startDate && (
          <button
            onClick={handleClear}
            className="text-neutral-400 hover:text-white p-1 ml-1"
            title="Clear dates"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bookable Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={onlyBookable}
          onChange={(e) => onToggleOnlyBookable(e.target.checked)}
          className="rounded border-neutral-700 bg-neutral-950 text-neutral-100 focus:ring-0 cursor-pointer w-3.5 h-3.5"
        />
        <span className="text-neutral-300">
          Only available now {startDate ? `(${openCount} open)` : ''}
        </span>
      </label>
    </div>
  );
};
