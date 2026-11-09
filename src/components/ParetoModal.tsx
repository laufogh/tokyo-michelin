import React, { useMemo } from 'react';
import { Restaurant, Currency } from '../types';
import { formatPriceRange } from '../utils/bookingCalculator';
import { X, Sparkles, ExternalLink, Zap } from 'lucide-react';

interface ParetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  paretoIds: Set<string>;
  onSelectRestaurant: (r: Restaurant) => void;
  onOpenDetails: (r: Restaurant) => void;
  currency: Currency;
  isOnlyPareto: boolean;
  onToggleOnlyPareto: () => void;
}

export const ParetoModal: React.FC<ParetoModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  paretoIds,
  onSelectRestaurant,
  onOpenDetails,
  currency,
  isOnlyPareto,
  onToggleOnlyPareto,
}) => {
  if (!isOpen) return null;

  // Sort pareto points by price for the frontier line
  const paretoRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => paretoIds.has(r.id))
      .sort((a, b) => a.price.dinnerMin - b.price.dinnerMin);
  }, [restaurants, paretoIds]);

  // SVG chart dimensions & scaling
  const minPrice = useMemo(() => Math.min(...restaurants.map((r) => r.price.dinnerMin * 2 * 0.045)), [restaurants]);
  const maxPrice = useMemo(() => Math.max(...restaurants.map((r) => r.price.dinnerMin * 2 * 0.045)), [restaurants]);
  const minScore = 3.65;
  const maxScore = 4.70;

  const width = 640;
  const height = 320;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const getX = (priceDkk: number) => {
    const norm = (priceDkk - minPrice) / (maxPrice - minPrice || 1);
    return padding.left + norm * (width - padding.left - padding.right);
  };

  const getY = (score: number) => {
    const norm = (score - minScore) / (maxScore - minScore);
    return height - padding.bottom - norm * (height - padding.top - padding.bottom);
  };

  // Generate frontier path
  const frontierPoints = paretoRestaurants.map((r) => {
    const priceDkk = r.price.dinnerMin * 2 * 0.045;
    return `${getX(priceDkk)},${getY(r.tabelogScore)}`;
  });
  const frontierPathData = frontierPoints.length > 0 ? `M ${frontierPoints.join(' L ')}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Tokyo Dining Pareto Front (Price vs. Rating Tradeoff)
              </h3>
              <p className="text-[11px] text-neutral-400">
                {paretoRestaurants.length} of {restaurants.length} restaurants are on the optimal frontier.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description Banner */}
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-400 max-w-lg">
            A restaurant is on the <strong>Pareto Front</strong> if no other restaurant in Tokyo offers a higher Tabelog score / Michelin rating for the same or lower price.
          </p>
          <button
            onClick={() => {
              onToggleOnlyPareto();
              onClose();
            }}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition"
          >
            {isOnlyPareto ? 'Show All Restaurants' : 'Filter Map by Pareto Front'}
          </button>
        </div>

        {/* Content: Interactive Scatter Plot */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 overflow-x-auto">
            <div className="text-[11px] text-neutral-400 mb-2 flex justify-between font-mono">
              <span>▲ Vertical: Tabelog Rating (Quality)</span>
              <span>Horizontal: Dinner Price (2 adults in DKK) ▶</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-neutral-400">
              {/* Grid Lines */}
              {[3.8, 4.0, 4.2, 4.4, 4.6].map((score) => (
                <g key={score}>
                  <line
                    x1={padding.left}
                    y1={getY(score)}
                    x2={width - padding.right}
                    y2={getY(score)}
                    stroke="#262626"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={padding.left - 8}
                    y={getY(score) + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#737373"
                    fontFamily="monospace"
                  >
                    {score.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Price Axis labels */}
              {[500, 1500, 3000, 4500].map((pr) => {
                const x = getX(pr);
                return (
                  <g key={pr}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke="#262626"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#737373"
                      fontFamily="monospace"
                    >
                      {pr} kr.
                    </text>
                  </g>
                );
              })}

              {/* Pareto Frontier Line */}
              {frontierPathData && (
                <path
                  d={frontierPathData}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  opacity="0.8"
                />
              )}

              {/* Dominated Points (dimmed) */}
              {restaurants
                .filter((r) => !paretoIds.has(r.id))
                .map((r) => {
                  const priceDkk = r.price.dinnerMin * 2 * 0.045;
                  const cx = getX(priceDkk);
                  const cy = getY(r.tabelogScore);
                  return (
                    <circle
                      key={r.id}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#525252"
                      opacity="0.4"
                      className="cursor-pointer hover:opacity-100 hover:fill-neutral-200 transition"
                      onClick={() => onOpenDetails(r)}
                    >
                      <title>{`${r.name}: ${r.tabelogScore} Tabelog | ~${Math.round(priceDkk)} kr. for 2`}</title>
                    </circle>
                  );
                })}

              {/* Pareto Optimal Points (Highlighted Amber) */}
              {paretoRestaurants.map((r) => {
                const priceDkk = r.price.dinnerMin * 2 * 0.045;
                const cx = getX(priceDkk);
                const cy = getY(r.tabelogScore);
                return (
                  <g
                    key={r.id}
                    className="cursor-pointer group"
                    onClick={() => onOpenDetails(r)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#f59e0b"
                      stroke="#171717"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      x={cx + 8}
                      y={cy - 4}
                      fontSize="10"
                      fill="#f5f5f5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {r.name.split(' ')[0]}
                    </text>
                    <title>{`⚡ Pareto Frontier: ${r.name} (${r.tabelogScore} Tabelog, ~${Math.round(priceDkk)} kr. for 2)`}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Pareto Frontier List Table */}
          <div>
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Optimal Frontier Venues (Ranked by Value & Performance)
            </h4>
            <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 text-xs">
              {paretoRestaurants.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectRestaurant(r);
                    onOpenDetails(r);
                  }}
                  className="p-2.5 flex items-center justify-between hover:bg-neutral-900 cursor-pointer transition gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-bold">⚡</span>
                    <span className="font-semibold text-white truncate">{r.name}</span>
                    <span className="text-neutral-500 text-[11px]">{r.cuisineDisplay}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-amber-400 font-bold">{r.tabelogScore.toFixed(2)} ★</span>
                    <span className="text-neutral-300">
                      {formatPriceRange(r.price.dinnerMin, r.price.dinnerMax, currency, 2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
