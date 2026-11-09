import React from 'react';
import { Restaurant, Currency } from '../types';
import { formatPriceRange, calculateTotalDinnerBreakdown } from '../utils/bookingCalculator';
import { X, Trash2, Download } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRestaurants: Restaurant[];
  onRemove: (id: string) => void;
  onOpenDetails: (r: Restaurant) => void;
  currency: Currency;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  savedRestaurants,
  onRemove,
  onOpenDetails,
  currency,
}) => {
  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    let md = `# Tokyo Michelin Dining Wishlist & Itinerary\n\n`;
    md += `Exported on: ${new Date().toLocaleDateString()}\n\n`;
    savedRestaurants.forEach((r, idx) => {
      const bd = calculateTotalDinnerBreakdown(r, currency, 2);
      md += `### ${idx + 1}. ${r.name} (${r.nameJapanese})\n`;
      md += `- **Michelin:** ${r.stars === 'Bib Gourmand' ? 'Bib Gourmand' : `${r.stars} Star${typeof r.stars === 'number' && r.stars > 1 ? 's' : ''}`}\n`;
      md += `- **Cuisine:** ${r.cuisineDisplay}\n`;
      md += `- **Ward & Station:** ${r.ward} (${r.nearestStation})\n`;
      md += `- **Tabelog Rating:** ${r.tabelogScore} (${r.tabelogAward})\n`;
      md += `- **Total Price (2 adults):** ${bd.totalDisplay}${bd.hasFee ? ` (Course: ${bd.baseDisplay} + ${bd.feeLabel}: ${bd.feeDisplay})` : ''}\n`;
      md += `- **Booking Platform:** ${r.bookingPlatform} (${r.bookingUrl || 'Walk-in'})\n`;
      md += `- **Booking Schedule:** ${r.bookingRule.description}\n`;
      md += `- **Address (Taxi):** ${r.addressJapanese}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokyo-michelin-wishlist-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              My Tokyo Dining Itinerary
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              {savedRestaurants.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedRestaurants.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-4xl mb-3">🔖</div>
              <h4 className="text-sm font-bold text-white mb-1">
                Your Tokyo Itinerary is Empty
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click the bookmark icon on any restaurant card to save your dream dining destinations for your Tokyo trip.
              </p>
            </div>
          ) : (
            savedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex gap-3 group relative hover:border-slate-600 transition"
              >
                <img
                  src={restaurant.coverImage}
                  alt={restaurant.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4
                      onClick={() => onOpenDetails(restaurant)}
                      className="text-xs font-bold text-white truncate cursor-pointer hover:text-red-400 transition"
                    >
                      {restaurant.name}
                    </h4>
                    <button
                      onClick={() => onRemove(restaurant.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {restaurant.cuisineDisplay} • {restaurant.ward}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="font-semibold text-amber-400">
                      ★ {restaurant.tabelogScore} Tabelog
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-200 font-mono">
                      {calculateTotalDinnerBreakdown(restaurant, currency, 2).totalDisplay}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">
                    Book on: {restaurant.bookingPlatform}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {savedRestaurants.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-950/50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Itinerary (.md)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
