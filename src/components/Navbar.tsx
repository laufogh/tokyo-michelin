import React from 'react';
import { Currency } from '../types';
import { Bookmark, Github } from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  filteredCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyChange,
  wishlistCount,
  onOpenWishlist,
  filteredCount,
  totalCount,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wider uppercase text-neutral-100">
            Tokyo Michelin
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {filteredCount === totalCount ? `${totalCount} spots` : `${filteredCount} / ${totalCount}`}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3 text-xs">
          {/* Currency Toggle */}
          <div className="flex items-center border border-neutral-800 rounded bg-neutral-900 overflow-hidden text-[11px] font-mono">
            {(['JPY', 'USD', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`px-2 py-1 transition ${
                  currency === c
                    ? 'bg-neutral-100 text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Saved */}
          <button
            onClick={onOpenWishlist}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white transition"
          >
            <Bookmark className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-neutral-200' : ''}`} />
            <span>Saved ({wishlistCount})</span>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/laufogh/tokyo-michelin"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 hover:text-white p-1"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
