import { useState, useMemo, useEffect } from 'react';
import { RESTAURANTS_DATA } from './data/restaurants';
import { Restaurant, CuisineType, MichelinStars, SortOption, Currency, TravelWindow } from './types';
import { calculateAvailability } from './utils/bookingCalculator';
import { computeParetoFront } from './utils/pareto';
import { Navbar } from './components/Navbar';
import { TripDateSelector } from './components/TripDateSelector';
import { FilterBar } from './components/FilterBar';
import { MapComponent } from './components/MapComponent';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantModal } from './components/RestaurantModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ParetoModal } from './components/ParetoModal';

export function App() {
  // Travel Window State
  const [travelWindow, setTravelWindow] = useState<TravelWindow | null>(null);
  const [onlyBookable, setOnlyBookable] = useState<boolean>(false);

  // Filters State
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('all');
  const [selectedStars, setSelectedStars] = useState<MichelinStars | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'welcoming'>('all');
  const [isOnlyPareto, setIsOnlyPareto] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('michelin');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [currency, setCurrency] = useState<Currency>('DKK');

  // Interaction State
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalRestaurant, setModalRestaurant] = useState<Restaurant | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isParetoModalOpen, setIsParetoModalOpen] = useState<boolean>(false);

  // Saved Wishlist
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

  // Pareto frontier set
  const paretoIds = useMemo(() => {
    return computeParetoFront(RESTAURANTS_DATA);
  }, []);

  // Filtered and Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => {
      if (isOnlyPareto && !paretoIds.has(r.id)) {
        return false;
      }
      if (selectedCuisine !== 'all' && r.cuisine !== selectedCuisine) {
        return false;
      }
      if (selectedStars !== 'all' && r.stars !== selectedStars) {
        return false;
      }
      if (selectedLanguage === 'welcoming' && r.languageAdvisability === 'Challenging (Japanese Preferred)') {
        return false;
      }
      if (onlyBookable) {
        const avail = calculateAvailability(r, travelWindow);
        if (!avail.canBookNow) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchJp = r.nameJapanese.includes(q);
        const matchWard = r.ward.toLowerCase().includes(q);
        const matchStation = r.nearestStation.toLowerCase().includes(q);
        const matchCuisine = r.cuisineDisplay.toLowerCase().includes(q);
        if (!matchName && !matchJp && !matchWard && !matchStation && !matchCuisine) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'michelin') {
        const starOrder: Record<string, number> = { 3: 4, 2: 3, 1: 2, 'Bib Gourmand': 1 };
        const diff = (starOrder[String(b.stars)] || 0) - (starOrder[String(a.stars)] || 0);
        if (diff !== 0) return diff;
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
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [
    selectedCuisine,
    selectedStars,
    selectedLanguage,
    isOnlyPareto,
    paretoIds,
    searchQuery,
    sortBy,
    onlyBookable,
    travelWindow,
  ]);

  const openCount = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => calculateAvailability(r, travelWindow).canBookNow).length;
  }, [travelWindow]);

  const savedRestaurants = useMemo(() => {
    return RESTAURANTS_DATA.filter((r) => savedIds.has(r.id));
  }, [savedIds]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        wishlistCount={savedIds.size}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        filteredCount={filteredRestaurants.length}
        totalCount={RESTAURANTS_DATA.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full flex flex-col gap-3">
        {/* Travel Window Picker */}
        <TripDateSelector
          travelWindow={travelWindow}
          onUpdateTravelWindow={setTravelWindow}
          onlyBookable={onlyBookable}
          onToggleOnlyBookable={setOnlyBookable}
          openCount={openCount}
        />

        {/* Filter Bar */}
        <FilterBar
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          selectedStars={selectedStars}
          onSelectStars={setSelectedStars}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          isOnlyPareto={isOnlyPareto}
          onToggleOnlyPareto={() => setIsOnlyPareto((p) => !p)}
          onOpenParetoModal={() => setIsParetoModalOpen(true)}
          paretoCount={paretoIds.size}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categoryCounts={categoryCounts}
        />

        {/* Empty state */}
        {filteredRestaurants.length === 0 && (
          <div className="py-16 text-center text-xs text-neutral-500">
            No restaurants found matching your filters.
          </div>
        )}

        {/* View Mode: Split */}
        {viewMode === 'split' && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1">
            {/* List */}
            <div className="lg:col-span-7 space-y-2.5 overflow-y-auto max-h-[calc(100vh-13rem)] pr-1">
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
                  isPareto={paretoIds.has(restaurant.id)}
                />
              ))}
            </div>

            {/* Map */}
            <div className="lg:col-span-5 sticky top-16 h-[calc(100vh-13rem)] min-h-[420px]">
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

        {/* View Mode: Full List */}
        {viewMode === 'list' && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                isPareto={paretoIds.has(restaurant.id)}
              />
            ))}
          </div>
        )}

        {/* View Mode: Full Map */}
        {viewMode === 'map' && filteredRestaurants.length > 0 && (
          <div className="h-[calc(100vh-13rem)] min-h-[450px]">
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
      </main>

      {/* Details Modal */}
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

      {/* Pareto Frontier Modal */}
      <ParetoModal
        isOpen={isParetoModalOpen}
        onClose={() => setIsParetoModalOpen(false)}
        restaurants={filteredRestaurants}
        paretoIds={paretoIds}
        onSelectRestaurant={setSelectedRestaurant}
        onOpenDetails={setModalRestaurant}
        currency={currency}
        isOnlyPareto={isOnlyPareto}
        onToggleOnlyPareto={() => setIsOnlyPareto((p) => !p)}
      />
    </div>
  );
}

export default App;
