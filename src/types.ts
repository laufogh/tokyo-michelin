export type MichelinStars = 3 | 2 | 1 | 'Bib Gourmand';

export type CuisineType = 
  | 'all'
  | 'sushi'
  | 'ramen'
  | 'kaiseki'
  | 'french'
  | 'tempura'
  | 'yakitori'
  | 'beef'
  | 'soba'
  | 'chinese'
  | 'italian'
  | 'innovative';

export type TabelogAward = 'Gold' | 'Silver' | 'Bronze' | 'Hyakumeiten' | 'None';

export type BookingPlatform = 
  | 'TableCheck'
  | 'Omakase.in'
  | 'Pocket Concierge'
  | 'AutoReserve'
  | 'Tabelog'
  | 'Phone / Concierge'
  | 'Walk-in Only';

export type BookingWindowType = 
  | 'first_of_month'
  | 'days_in_advance'
  | 'weekly'
  | 'hotel_concierge_only'
  | 'walk_in'
  | 'always_open';

export interface BookingRule {
  windowType: BookingWindowType;
  advanceDays?: number;
  monthAdvanceCount?: number;
  timeJST?: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme / Lottery';
  tips?: string;
}

export interface PriceRange {
  lunchMin?: number;
  lunchMax?: number;
  dinnerMin: number;
  dinnerMax: number;
  tier: 1 | 2 | 3 | 4 | 5; // 1: <¥5k, 2: ¥5k-15k, 3: ¥15k-30k, 4: ¥30k-50k, 5: >¥50k
}

export interface Restaurant {
  id: string;
  name: string;
  nameJapanese: string;
  stars: MichelinStars;
  greenStar?: boolean;
  cuisine: CuisineType;
  cuisineDisplay: string;
  ward: string;
  address: string;
  addressJapanese: string;
  coordinates: [number, number]; // [lat, lng]
  nearestStation: string;
  tabelogScore: number;
  tabelogAward?: TabelogAward;
  tabelogUrl: string;
  redditRating: number; // e.g. 4.8 / 5.0
  redditMentionsCount: number;
  redditUpvotePercentage: number;
  redditQuote: string;
  redditSubreddits: string[];
  price: PriceRange;
  bookingPlatform: BookingPlatform;
  bookingUrl?: string;
  bookingRule: BookingRule;
  description: string;
  highlights: string[];
  coverImage: string;
  closedDays: string;
  lunchHours?: string;
  dinnerHours?: string;
  seatsCount?: number;
  dressCode?: string;
}

export interface TravelWindow {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  partySize: number;
  mealType: 'any' | 'lunch' | 'dinner';
}

export interface AvailabilityResult {
  status: 'open' | 'upcoming' | 'restricted' | 'walk_in';
  badgeText: string;
  openDateFormatted?: string;
  calendarDate?: Date;
  message: string;
  canBookNow: boolean;
  colorClass: string;
}

export type Currency = 'DKK' | 'EUR' | 'USD' | 'JPY';

export type SortOption = 
  | 'michelin'
  | 'tabelog'
  | 'reddit'
  | 'price_asc'
  | 'price_desc'
  | 'availability'
  | 'name';
