import React from 'react';
import { CuisineType, MichelinStars, SortOption } from '../types';
import { CUISINE_CATEGORIES } from '../data/restaurants';
import { Search, Map, LayoutList } from 'lucide-react';

interface FilterBarProps {
  selectedCuisine: CuisineType;
  onSelectCuisine: (c: CuisineType) => void;
  selectedStars: MichelinStars | 'all';
  onSelectStars: (s: MichelinStars | 'all') => void;
  selectedLanguage: 'all' | 'welcoming';
  onSelectLanguage: (l: 'all' | 'welcoming') => void;
  isOnlyPareto: boolean;
  onToggleOnlyPareto: () => void;
  onOpenParetoModal: () => void;
  paretoCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
  categoryCounts: Record<string, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCuisine,
  onSelectCuisine,
  selectedStars,
  onSelectStars,
  selectedLanguage,
  onSelectLanguage,
  isOnlyPareto,
  onToggleOnlyPareto,
  onOpenParetoModal,
  paretoCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categoryCounts,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Search, Sort, Stars & View Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search restaurant, area, or station..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 pl-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>

        {/* Michelin Stars Selector */}
        <div className="flex items-center border border-neutral-800 rounded bg-neutral-900 p-0.5 text-xs">
          {(['all', 3, 2, 1, 'Bib Gourmand'] as (MichelinStars | 'all')[]).map((star) => (
            <button
              key={String(star)}
              onClick={() => onSelectStars(star)}
              className={`px-2 py-1 rounded transition text-[11px] ${
                selectedStars === star
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {star === 'all' && 'All Stars'}
              {star === 3 && '3★'}
              {star === 2 && '2★'}
              {star === 1 && '1★'}
              {star === 'Bib Gourmand' && 'Bib'}
            </button>
          ))}
        </div>

        {/* Pareto Optimal Filter & Curve Trigger */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleOnlyPareto}
            className={`px-2.5 py-1.5 rounded border text-xs font-mono transition flex items-center gap-1 ${
              isOnlyPareto
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-500'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800'
            }`}
            title="Filter by Pareto Front (Undominated Quality vs. Price)"
          >
            <span>⚡ Pareto Front</span>
            <span className="text-[10px] opacity-75">({paretoCount})</span>
          </button>
          <button
            onClick={onOpenParetoModal}
            className="px-2 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-xs transition font-mono"
            title="View Pareto Tradeoff Curve Chart"
          >
            Chart
          </button>
        </div>

        {/* Language Advisability Toggle */}
        <button
          onClick={() => onSelectLanguage(selectedLanguage === 'all' ? 'welcoming' : 'all')}
          className={`px-2.5 py-1.5 rounded border text-xs transition ${
            selectedLanguage === 'welcoming'
              ? 'bg-neutral-100 text-neutral-950 font-semibold border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
          }`}
          title="Filter for restaurants highly welcoming to non-Japanese speakers"
        >
          {selectedLanguage === 'welcoming' ? '✓ No Japanese Needed' : 'No Japanese Needed'}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center text-xs">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="michelin">Sort: Michelin Stars</option>
            <option value="tabelog">Sort: Tabelog Score</option>
            <option value="reddit">Sort: Reddit Rating</option>
            <option value="price_asc">Sort: Price (Low → High)</option>
            <option value="price_desc">Sort: Price (High → Low)</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>

        {/* View Mode (Split vs Full List vs Full Map on mobile/desktop) */}
        <div className="flex items-center border border-neutral-800 rounded bg-neutral-900 p-0.5 text-xs">
          <button
            onClick={() => onViewModeChange('split')}
            className={`px-2 py-1 rounded transition text-[11px] ${
              viewMode === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2 py-1 rounded transition text-[11px] ${
              viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`px-2 py-1 rounded transition text-[11px] ${
              viewMode === 'map' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Cuisines Bar: Minimalist text tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {CUISINE_CATEGORIES.map((cat) => {
          const isSelected = selectedCuisine === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCuisine(cat.id as CuisineType)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition ${
                isSelected
                  ? 'bg-neutral-200 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1 text-[10px] opacity-60 font-mono">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
