import React from 'react';
import { X, Award } from 'lucide-react';

interface TabelogGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TabelogGuideModal: React.FC<TabelogGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Understanding Tabelog (食べログ) Ratings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            In Japan, Google Reviews or Yelp are rarely used by serious food enthusiasts. Instead, <strong>Tabelog (食べログ)</strong> is the undisputed authority. Unlike Western review platforms where average restaurants receive 4.5 stars, Tabelog uses an aggressive Bayesian weighting algorithm where scores above 3.50 are exceptional!
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-sm">4.00 – 4.50+</span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                  Tabelog Gold / Silver
                </span>
              </div>
              <p className="mt-1 text-slate-300">
                <strong>The Top 0.01% in Japan:</strong> Globally legendary. Getting a seat often requires booking months in advance or regular customer introductions. Many 1-star or non-starred sushi-ya with a 4.2+ score are harder to book than 3-star French restaurants.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">3.80 – 3.99</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-amber-300 font-bold text-[10px]">
                  Tabelog Hyakumeiten (Top 100)
                </span>
              </div>
              <p className="mt-1 text-slate-300">
                <strong>Elite Masterclass:</strong> Top 0.1% of restaurants in the country. Phenomenal food that draws lines around the block or sells out reservation slots in minutes.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 text-sm">3.50 – 3.79</span>
                <span className="text-slate-400 text-[10px]">Top 3% of Tokyo</span>
              </div>
              <p className="mt-1 text-slate-300">
                <strong>Very Good to Outstanding:</strong> A restaurant with a 3.55+ score on Tabelog is reliably superior to 97% of eateries in Japan.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 border-l-2 border-red-500 rounded-r-xl">
            <h5 className="font-bold text-white mb-1">Michelin vs. Tabelog Discrepancies</h5>
            <p className="text-slate-400">
              Michelin inspectors judge Western technique, plate presentation, and international service standards. Japanese foodies on Tabelog judge hyper-specific craftsmanship (e.g. shari temperature, soba flour origin, chicken breed charcoal char). By comparing both, you get the truest picture of Tokyo fine dining!
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
};
