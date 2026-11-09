import { Restaurant, TravelWindow, AvailabilityResult, Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number }> = {
  JPY: { symbol: '¥', rate: 1 },
  USD: { symbol: '$', rate: 0.0065 }, // ~$1 = ¥154
  EUR: { symbol: '€', rate: 0.0060 }, // ~€1 = ¥166
  GBP: { symbol: '£', rate: 0.0051 }, // ~£1 = ¥196
};

export function formatPrice(amountJpy: number, currency: Currency = 'JPY'): string {
  const { symbol, rate } = CURRENCY_RATES[currency];
  if (currency === 'JPY') {
    return `${symbol}${amountJpy.toLocaleString('en-US')}`;
  }
  const converted = Math.round(amountJpy * rate);
  return `${symbol}${converted.toLocaleString('en-US')}`;
}

export function formatPriceRange(min?: number, max?: number, currency: Currency = 'JPY'): string {
  if (!min && !max) return 'N/A';
  if (!min) return formatPrice(max!, currency);
  if (!max) return `From ${formatPrice(min, currency)}`;
  return `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
}

export function calculateAvailability(
  restaurant: Restaurant,
  travelWindow?: TravelWindow | null
): AvailabilityResult {
  const rule = restaurant.bookingRule;

  if (rule.windowType === 'walk_in') {
    return {
      status: 'walk_in',
      badgeText: 'Walk-in / Queue',
      message: rule.description || 'No reservations taken. Queue in person or line up before opening.',
      canBookNow: false,
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
  }

  if (rule.windowType === 'hotel_concierge_only') {
    return {
      status: 'restricted',
      badgeText: 'Hotel Concierge / Regulars Only',
      message: rule.description || 'Strictly booked via luxury hotel concierge (Aman, Palace Hotel) or regular invitation.',
      canBookNow: false,
      colorClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
  }

  // If no travel window is selected, show general booking policy
  if (!travelWindow || !travelWindow.startDate) {
    if (rule.windowType === 'always_open') {
      return {
        status: 'open',
        badgeText: 'Reservations Open',
        message: rule.description,
        canBookNow: true,
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    }
    return {
      status: 'upcoming',
      badgeText: 'Scheduled Releases',
      message: rule.description,
      canBookNow: true,
      colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    };
  }

  // Evaluate based on travel start date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tripStart = new Date(travelWindow.startDate);
  tripStart.setHours(0, 0, 0, 0);

  if (rule.windowType === 'first_of_month') {
    const advanceMonths = rule.monthAdvanceCount ?? 1;
    // Calculate the release date: 1st day of (tripStart month - advanceMonths)
    const releaseDate = new Date(tripStart.getFullYear(), tripStart.getMonth() - advanceMonths, 1);
    
    if (today >= releaseDate) {
      return {
        status: 'open',
        badgeText: 'Window Open Now',
        openDateFormatted: `Released on ${releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        calendarDate: releaseDate,
        message: `Reservations for your travel dates opened on ${releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (${rule.timeJST || '10:00 AM JST'}). Book ASAP before seats fill.`,
        canBookNow: true,
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    } else {
      const diffTime = releaseDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        badgeText: `Opens in ${diffDays}d (${releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        openDateFormatted: releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        calendarDate: releaseDate,
        message: `Booking opens on ${releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${rule.timeJST || '10:00 AM JST'}. Set a reminder so you don't miss it!`,
        canBookNow: false,
        colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }
  }

  if (rule.windowType === 'days_in_advance') {
    const advanceDays = rule.advanceDays ?? 30;
    const releaseDate = new Date(tripStart);
    releaseDate.setDate(releaseDate.getDate() - advanceDays);

    if (today >= releaseDate) {
      return {
        status: 'open',
        badgeText: 'Window Open Now',
        openDateFormatted: `Opened ${advanceDays} days prior`,
        calendarDate: releaseDate,
        message: `Bookings open ${advanceDays} days in advance rolling. Your travel window is currently within the active reservation window!`,
        canBookNow: true,
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    } else {
      const diffTime = releaseDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        badgeText: `Opens in ${diffDays}d (${releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        openDateFormatted: releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        calendarDate: releaseDate,
        message: `Opens exactly ${advanceDays} days before dining (${releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${rule.timeJST || 'midnight JST'}).`,
        canBookNow: false,
        colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }
  }

  // Fallback for always open or other
  return {
    status: 'open',
    badgeText: 'Bookings Open',
    message: rule.description,
    canBookNow: true,
    colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };
}

export function generateGoogleCalendarUrl(restaurant: Restaurant, date: Date): string {
  const title = encodeURIComponent(`Tokyo Michelin Booking Drop: ${restaurant.name}`);
  const details = encodeURIComponent(
    `Book table at ${restaurant.name} (${restaurant.stars} Michelin / Tabelog ${restaurant.tabelogScore}).\nPlatform: ${restaurant.bookingPlatform}\nURL: ${restaurant.bookingUrl || 'See website'}\nRule: ${restaurant.bookingRule.description}`
  );
  const location = encodeURIComponent(`${restaurant.name}, Tokyo, Japan`);

  // Format date YYYYMMDDTHHmmSSZ
  const startTime = new Date(date);
  startTime.setHours(10, 0, 0, 0); // Default to 10:00 AM JST -> convert to UTC
  // 10:00 JST is 01:00 UTC
  const startIso = startTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endTime = new Date(startTime.getTime() + 30 * 60000);
  const endIso = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
}
