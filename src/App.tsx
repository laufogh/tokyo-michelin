import { useState, useMemo, useEffect } from 'react';
import { RESTAURANTS_DATA } from './data/restaurants';
import { Restaurant, CuisineType, MichelinStars, SortOption, Currency, TravelWindow } from './types';
import { calculateAvailability } from './utils/bookingCalculator';
import { Navbar } from './components/Navbar';
import { TripDateSelector } from './components/TripDateSelector';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { MapComponent } from './components/MapComponent';
import { RestaurantCard } from './components/RestaurantCard';
import { TableView } from './components/TableView';
import { RestaurantModal } from './components/RestaurantModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { TabelogGuideModal } from './components/TabelogGuideModal';

export function App() {
  // Travel Window State
  const [travelWindow, setTravelWindow] = useState<TravelWindow | null>(() => {
    // Default to ~30 days from now for a 7-day trip demo
    const start = new Date();
    start.setDate(start.getDate() + 30);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      partySize: 2,
      mealType: 'any',
    };
  });

  const [onlyBookable, setOnlyBookable] = useState<boolean>(false);

  // Filters State
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('all');
  const [selectedStars, setSelectedStars] = useState<MichelinStars | 'all'>('all');
  const [minTabelog, setMinTabelog] = useState<number>(0);
  const [selectedWard, setSelectedWard] = useState<string>('All Tokyo');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('michelin');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid' | 'table'>('split');
  const [currency, setCurrency] = useState<Currency>('JPY');

  // Interaction State
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalRestaurant, setModalRestaurant] = useState<Restaurant | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTabelogGuideOpen, setIsTabelogGuideOpen] = useState<boolean>(false);

  // Saved Wishlist (persisted in localStorage)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('tokyo_michelin_saved');
      return stored ? new Set(JSON.parse(stored)) : new Set(['sezanne', 'ginza-hachigo']);
    } catch {
      return new Set(['sezanne', 'ginza-hachigo']);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tokyo_michelin_saved', JSON.stringify(Array.from(savedIds)));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Cuisine category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: RESTAURANTS_DATA.length };
    RESTAURANTS_DATA.forEach((r) => {
      counts[r.cuisine] = (counts[r.cuisine] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered and Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => {
      // Cuisine filter
      if (selectedCuisine !== 'all' && r.cuisine !== selectedCuisine) {
        return false;
      }

      // Stars filter
      if (selectedStars !== 'all' && r.stars !== selectedStars) {
        return false;
      }

      // Tabelog score filter
      if (minTabelog > 0 && r.tabelogScore < minTabelog) {
        return false;
      }

      // Ward filter
      if (selectedWard !== 'All Tokyo' && !r.ward.includes(selectedWard.split(' ')[0])) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all' && r.bookingPlatform !== selectedPlatform) {
        return false;
      }

      // Only Bookable Now filter
      if (onlyBookable) {
        const avail = calculateAvailability(r, travelWindow);
        if (!avail.canBookNow) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesJp = r.nameJapanese.includes(q);
        const matchesWard = r.ward.toLowerCase().includes(q);
        const matchesStation = r.nearestStation.toLowerCase().includes(q);
        const matchesCuisine = r.cuisineDisplay.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesHighlights = r.highlights.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesJp && !matchesWard && !matchesStation && !matchesCuisine && !matchesDesc && !matchesHighlights) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'michelin') {
        const starOrder: Record<string, number> = { 3: 4, 2: 3, 1: 2, 'Bib Gourmand': 1 };
        const starDiff = (starOrder[String(b.stars)] || 0) - (starOrder[String(a.stars)] || 0);
        if (starDiff !== 0) return starDiff;
        return b.tabelogScore - a.tabelogScore;
      }
      if (sortBy === 'tabelog') {
        return b.tabelogScore - a.tabelogScore;
      }
      if (sortBy === 'reddit') {
        return b.redditRating - a.redditRating;
      }
      if (sortBy === 'price_asc') {
        return a.price.dinnerMin - b.price.dinnerMin;
      }
      if (sortBy === 'price_desc') {
        return b.price.dinnerMax - a.price.dinnerMax;
      }
      if (sortBy === 'availability') {
        const availA = calculateAvailability(a, travelWindow).canBookNow ? 1 : 0;
        const availB = calculateAvailability(b, travelWindow).canBookNow ? 1 : 0;
        return availB - availA;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [
    selectedCuisine,
    selectedStars,
    minTabelog,
    selectedWard,
    selectedPlatform,
    searchQuery,
    sortBy,
    onlyBookable,
    travelWindow,
  ]);

  // Open bookable count
  const openCount = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => calculateAvailability(r, travelWindow).canBookNow).length;
  }, [travelWindow]);

  const savedRestaurants = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => savedIds.has(r.id));
  }, [savedIds]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        wishlistCount={savedIds.size}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTabelogGuide={() => setIsTabelogGuideOpen(true)}
        restaurantsCount={RESTAURANTS_DATA.length}
        filteredCount={filteredRestaurants.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Travel Date Window Selector (Key Requirement) */}
        <TripDateSelector
          travelWindow={travelWindow}
          onUpdateTravelWindow={setTravelWindow}
          onlyBookable={onlyBookable}
          onToggleOnlyBookable={setOnlyBookable}
          openCount={openCount}
        />

        {/* Quick Stats Banner */}
        <StatsOverview
          restaurants={filteredRestaurants}
          travelWindow={travelWindow}
          currency={currency}
        />

        {/* Filter Bar & Controls */}
        <FilterBar
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          selectedStars={selectedStars}
          onSelectStars={setSelectedStars}
          minTabelog={minTabelog}
          onMinTabelogChange={setMinTabelog}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categoryCounts={categoryCounts}
        />

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-white mb-1">
              No matching Tokyo restaurants found
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Try relaxing your filters (e.g. adjust minimum Tabelog score or disable "Only Bookable Now").
            </p>
            <button
              onClick={() => {
                setSelectedCuisine('all');
                setSelectedStars('all');
                setMinTabelog(0);
                setSelectedWard('All Tokyo');
                setSelectedPlatform('all');
                setSearchQuery('');
                setOnlyBookable(false);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* View Mode: Split (Map + Cards List) */}
        {viewMode === 'split' && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Cards List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing <strong className="text-white">{filteredRestaurants.length}</strong> restaurants
                </span>
                <span>Click card to pan map or view details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                    onSelect={() => setSelectedRestaurant(restaurant)}
                    onOpenDetails={() => setModalRestaurant(restaurant)}
                    isSaved={savedIds.has(restaurant.id)}
                    onToggleSave={() => toggleSave(restaurant.id)}
                    travelWindow={travelWindow}
                    currency={currency}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Leaflet Map */}
            <div className="lg:col-span-5 sticky top-20 h-[calc(100vh-6rem)]">
              <MapComponent
                restaurants={filteredRestaurants}
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={setSelectedRestaurant}
                onOpenDetails={setModalRestaurant}
                travelWindow={travelWindow}
                currency={currency}
              />
            </div>
          </div>
        )}

        {/* View Mode: Full Map */}
        {viewMode === 'map' && filteredRestaurants.length > 0 && (
          <div className="h-[calc(100vh-14rem)] min-h-[550px]">
            <MapComponent
              restaurants={filteredRestaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={setSelectedRestaurant}
              onOpenDetails={setModalRestaurant}
              travelWindow={travelWindow}
              currency={currency}
            />
          </div>
        )}

        {/* View Mode: Full Grid */}
        {viewMode === 'grid' && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSelected={selectedRestaurant?.id === restaurant.id}
                onSelect={() => setSelectedRestaurant(restaurant)}
                onOpenDetails={() => setModalRestaurant(restaurant)}
                isSaved={savedIds.has(restaurant.id)}
                onToggleSave={() => toggleSave(restaurant.id)}
                travelWindow={travelWindow}
                currency={currency}
              />
            ))}
          </div>
        )}

        {/* View Mode: Comparison Table */}
        {viewMode === 'table' && filteredRestaurants.length > 0 && (
          <TableView
            restaurants={filteredRestaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
            onOpenDetails={setModalRestaurant}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            travelWindow={travelWindow}
            currency={currency}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🥢</span>
            <span className="font-semibold text-slate-200">Tokyo Michelin & Tabelog Explorer</span>
            <span className="text-slate-600">•</span>
            <span>Accurate Coordinates, Tabelog Scores & Booking Rules</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsTabelogGuideOpen(true)} className="hover:text-white transition">
              Tabelog 4.0+ Guide
            </button>
            <span>•</span>
            <a
              href="https://github.com/laufogh/tokyo-michelin"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <RestaurantModal
        restaurant={modalRestaurant}
        isOpen={Boolean(modalRestaurant)}
        onClose={() => setModalRestaurant(null)}
        isSaved={modalRestaurant ? savedIds.has(modalRestaurant.id) : false}
        onToggleSave={() => modalRestaurant && toggleSave(modalRestaurant.id)}
        travelWindow={travelWindow}
        currency={currency}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        savedRestaurants={savedRestaurants}
        onRemove={toggleSave}
        onOpenDetails={setModalRestaurant}
        currency={currency}
      />

      {/* Tabelog Guide Modal */}
      <TabelogGuideModal
        isOpen={isTabelogGuideOpen}
        onClose={() => setIsTabelogGuideOpen(false)}
      />
    </div>
  );
}

export default App;
