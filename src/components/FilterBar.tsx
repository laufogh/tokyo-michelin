import React from 'react';
import { CuisineType, MichelinStars, SortOption } from '../types';
import { CUISINE_CATEGORIES, TOKYO_WARDS } from '../data/restaurants';
import { Search, ArrowUpDown, Map, LayoutGrid, Split, Table } from 'lucide-react';

interface FilterBarProps {
  selectedCuisine: CuisineType;
  onSelectCuisine: (c: CuisineType) => void;
  selectedStars: MichelinStars | 'all';
  onSelectStars: (s: MichelinStars | 'all') => void;
  minTabelog: number;
  onMinTabelogChange: (score: number) => void;
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'split' | 'map' | 'grid' | 'table';
  onViewModeChange: (mode: 'split' | 'map' | 'grid' | 'table') => void;
  categoryCounts: Record<string, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCuisine,
  onSelectCuisine,
  selectedStars,
  onSelectStars,
  minTabelog,
  onMinTabelogChange,
  selectedWard,
  onSelectWard,
  selectedPlatform,
  onSelectPlatform,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categoryCounts,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search, Sort, View Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by restaurant name, Japanese kanji, station, or keywords (e.g. 'Ginza', 'Duck', 'Yamayuki')..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Sort By Dropdown */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="michelin" className="bg-slate-800">Sort: Michelin Stars</option>
              <option value="tabelog" className="bg-slate-800">Sort: Tabelog Score</option>
              <option value="reddit" className="bg-slate-800">Sort: Reddit Community Score</option>
              <option value="price_asc" className="bg-slate-800">Sort: Price (Low to High)</option>
              <option value="price_desc" className="bg-slate-800">Sort: Price (High to Low)</option>
              <option value="availability" className="bg-slate-800">Sort: Booking Window</option>
              <option value="name" className="bg-slate-800">Sort: Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => onViewModeChange('split')}
              title="Split View (Map + List)"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'split' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid of Cards"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              title="Full Map View"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'map' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Comparison Table"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cuisine Categories Pills (Horizontal scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {CUISINE_CATEGORIES.map((cat) => {
          const isSelected = selectedCuisine === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCuisine(cat.id as CuisineType)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950/40'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-red-800/80 text-red-100' : 'bg-slate-700 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Deep Filters Row: Michelin Stars, Tabelog, Ward, Platform */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Michelin Stars Filter */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-1">
          <span className="text-slate-400 px-2 font-medium">Michelin:</span>
          {(['all', 3, 2, 1, 'Bib Gourmand'] as (MichelinStars | 'all')[]).map((star) => {
            const isSelected = selectedStars === star;
            return (
              <button
                key={String(star)}
                onClick={() => onSelectStars(star)}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {star === 'all' && 'All Stars'}
                {star === 3 && '⭐⭐⭐ 3 Stars'}
                {star === 2 && '⭐⭐ 2 Stars'}
                {star === 1 && '⭐ 1 Star'}
                {star === 'Bib Gourmand' && '🍽️ Bib Gourmand'}
              </button>
            );
          })}
        </div>

        {/* Minimum Tabelog Score Filter */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5">
          <span className="text-amber-400 font-medium mr-2">Tabelog:</span>
          <select
            value={minTabelog}
            onChange={(e) => onMinTabelogChange(Number(e.target.value))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value={0} className="bg-slate-800">Any Score</option>
            <option value={3.7} className="bg-slate-800">≥ 3.70 (Very Good)</option>
            <option value={3.8} className="bg-slate-800">≥ 3.80 (Top 100 Hyakumeiten)</option>
            <option value={4.0} className="bg-slate-800">≥ 4.00 (Elite World-Class)</option>
            <option value={4.3} className="bg-slate-800">≥ 4.30 (Legendary Gold/Silver)</option>
          </select>
        </div>

        {/* Neighborhood / Ward Selector */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5">
          <span className="text-slate-400 font-medium mr-2">Ward:</span>
          <select
            value={selectedWard}
            onChange={(e) => onSelectWard(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {TOKYO_WARDS.map((ward) => (
              <option key={ward} value={ward} className="bg-slate-800">
                {ward}
              </option>
            ))}
          </select>
        </div>

        {/* Booking Platform Filter */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5">
          <span className="text-slate-400 font-medium mr-2">Platform:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-800">All Platforms</option>
            <option value="TableCheck" className="bg-slate-800">TableCheck (Instant)</option>
            <option value="Omakase.in" className="bg-slate-800">Omakase.jp</option>
            <option value="Pocket Concierge" className="bg-slate-800">Pocket Concierge</option>
            <option value="Walk-in Only" className="bg-slate-800">Walk-in / Queue</option>
          </select>
        </div>
      </div>
    </div>
  );
};
