import React from 'react';
import { Currency } from '../types';
import { Bookmark, HelpCircle, Github, MapPin } from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenTabelogGuide: () => void;
  restaurantsCount: number;
  filteredCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyChange,
  wishlistCount,
  onOpenWishlist,
  onOpenTabelogGuide,
  restaurantsCount,
  filteredCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/50">
              <span className="text-xl">🥢</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Tokyo Michelin & Tabelog
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/60">
                  2025/2026 Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>Tokyo Fine Dining Explorer & Availability Calculator</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-medium">{filteredCount} of {restaurantsCount} spots</span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Tabelog Guide Trigger */}
            <button
              onClick={onOpenTabelogGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg hover:bg-amber-900/50 transition"
              title="Learn about the Tabelog Rating System"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tabelog Guide</span>
            </button>

            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs font-medium text-slate-300">
              {(['JPY', 'USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c)}
                  className={`px-2 py-1 rounded transition ${
                    currency === c
                      ? 'bg-red-600 text-white font-semibold shadow-sm'
                      : 'hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Wishlist / Trip Itinerary */}
            <button
              onClick={onOpenWishlist}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition"
            >
              <Bookmark className={`w-4 h-4 ${wishlistCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">My Itinerary</span>
              {wishlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/laufogh/tokyo-michelin"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
