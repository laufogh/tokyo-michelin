import { Restaurant, TravelWindow, AvailabilityResult, Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; isSuffix?: boolean }> = {
  DKK: { symbol: 'kr.', rate: 0.045, isSuffix: true },
  EUR: { symbol: '€', rate: 0.0060, isSuffix: false },
  USD: { symbol: '$', rate: 0.0065, isSuffix: false },
  JPY: { symbol: '¥', rate: 1, isSuffix: false },
};

export function formatPrice(amountJpy: number, currency: Currency = 'DKK', partySize: number = 2): string {
  const { symbol, rate, isSuffix } = CURRENCY_RATES[currency];
  const totalJpy = amountJpy * partySize;
  if (currency === 'JPY') {
    return `${symbol}${totalJpy.toLocaleString('ja-JP')}`;
  }
  const converted = Math.round(totalJpy * rate);
  if (isSuffix) {
    return `${converted.toLocaleString('da-DK')} ${symbol}`;
  }
  return `${symbol}${converted.toLocaleString('en-US')}`;
}

export function formatPriceRange(min?: number, max?: number, currency: Currency = 'DKK', partySize: number = 2): string {
  if (!min && !max) return 'N/A';
  if (!min) return formatPrice(max!, currency, partySize);
  if (!max) return `From ${formatPrice(min, currency, partySize)}`;
  
  const { symbol, rate, isSuffix } = CURRENCY_RATES[currency];
  if (currency === 'JPY') {
    return `¥${(min * partySize).toLocaleString('ja-JP')} – ¥${(max * partySize).toLocaleString('ja-JP')}`;
  }
  const minConverted = Math.round(min * partySize * rate);
  const maxConverted = Math.round(max * partySize * rate);
  if (isSuffix) {
    return `${minConverted.toLocaleString('da-DK')} – ${maxConverted.toLocaleString('da-DK')} ${symbol}`;
  }
  return `${symbol}${minConverted.toLocaleString('en-US')} – ${symbol}${maxConverted.toLocaleString('en-US')}`;
}

export function getBookingFeeJpy(restaurant: Restaurant, partySize: number = 2): number {
  if (restaurant.bookingRule.bookingFeeJpyPerPerson !== undefined) {
    return restaurant.bookingRule.bookingFeeJpyPerPerson * partySize;
  }
  const win = restaurant.bookingRule.windowType;
  const plat = restaurant.bookingPlatform;
  const desc = (restaurant.bookingRule.description || '').toLowerCase();
  const cType = restaurant.bookingRule.conciergeType;

  if (cType === 'regulars_only' || desc.includes('regular') || desc.includes('invitation')) {
    return 20000 * partySize; // ¥40,000 for 2 adults
  }
  if (cType === 'hotel_concierge' || win === 'hotel_concierge_only') {
    return 8000 * partySize; // ¥16,000 for 2 adults
  }
  if (cType === 'phone_concierge' || plat === 'Phone / Concierge') {
    return 4000 * partySize; // ¥8,000 for 2 adults
  }
  return 0;
}

export function getBookingFeeLabel(restaurant: Restaurant): string {
  if (restaurant.bookingRule.bookingFeeLabel) {
    return restaurant.bookingRule.bookingFeeLabel;
  }
  const win = restaurant.bookingRule.windowType;
  const plat = restaurant.bookingPlatform;
  const desc = (restaurant.bookingRule.description || '').toLowerCase();
  const cType = restaurant.bookingRule.conciergeType;

  if (cType === 'regulars_only' || desc.includes('regular') || desc.includes('invitation')) {
    return 'Regulars-Only VIP Proxy Fee';
  }
  if (cType === 'hotel_concierge' || win === 'hotel_concierge_only') {
    return '5-Star Hotel Concierge Fee';
  }
  if (cType === 'phone_concierge' || plat === 'Phone / Concierge') {
    return 'Phone Concierge Assistance Fee';
  }
  return 'Booking Fee';
}

export function getTotalDinnerPriceJpy(restaurant: Restaurant, bound: 'min' | 'max' = 'min', partySize: number = 2): number {
  const basePerPerson = bound === 'min' ? restaurant.price.dinnerMin : restaurant.price.dinnerMax;
  const fee = getBookingFeeJpy(restaurant, partySize);
  return (basePerPerson * partySize) + fee;
}

export function getTotalLunchPriceJpy(restaurant: Restaurant, bound: 'min' | 'max' = 'min', partySize: number = 2): number | undefined {
  if (restaurant.price.lunchMin === undefined) return undefined;
  const basePerPerson = bound === 'min' ? restaurant.price.lunchMin : (restaurant.price.lunchMax ?? restaurant.price.lunchMin);
  const fee = getBookingFeeJpy(restaurant, partySize);
  return (basePerPerson * partySize) + fee;
}

export interface TotalPriceBreakdown {
  totalDisplay: string;
  totalMinConverted: number;
  totalMaxConverted: number;
  baseDisplay: string;
  feeDisplay: string;
  feeJpy: number;
  hasFee: boolean;
  feeLabel: string;
  feeDetails?: string;
}

export function calculateTotalDinnerBreakdown(
  restaurant: Restaurant,
  currency: Currency = 'DKK',
  partySize: number = 2
): TotalPriceBreakdown {
  const { symbol, rate, isSuffix } = CURRENCY_RATES[currency];
  const feeJpy = getBookingFeeJpy(restaurant, partySize);
  const hasFee = feeJpy > 0;
  const feeLabel = getBookingFeeLabel(restaurant);
  const feeDetails = restaurant.bookingRule.bookingFeeDetails;

  const baseMinJpy = restaurant.price.dinnerMin * partySize;
  const baseMaxJpy = restaurant.price.dinnerMax * partySize;
  const totalMinJpy = baseMinJpy + feeJpy;
  const totalMaxJpy = baseMaxJpy + feeJpy;

  const totalMinConverted = Math.round(totalMinJpy * rate);
  const totalMaxConverted = Math.round(totalMaxJpy * rate);
  const baseMinConverted = Math.round(baseMinJpy * rate);
  const baseMaxConverted = Math.round(baseMaxJpy * rate);
  const feeConverted = Math.round(feeJpy * rate);

  let totalDisplay = '';
  let baseDisplay = '';
  let feeDisplay = '';

  if (currency === 'JPY') {
    totalDisplay = totalMinJpy === totalMaxJpy
      ? `¥${totalMinJpy.toLocaleString('ja-JP')}`
      : `¥${totalMinJpy.toLocaleString('ja-JP')} – ¥${totalMaxJpy.toLocaleString('ja-JP')}`;
    baseDisplay = baseMinJpy === baseMaxJpy
      ? `¥${baseMinJpy.toLocaleString('ja-JP')}`
      : `¥${baseMinJpy.toLocaleString('ja-JP')} – ¥${baseMaxJpy.toLocaleString('ja-JP')}`;
    feeDisplay = `+¥${feeJpy.toLocaleString('ja-JP')}`;
  } else if (isSuffix) {
    totalDisplay = totalMinConverted === totalMaxConverted
      ? `${totalMinConverted.toLocaleString('da-DK')} ${symbol}`
      : `${totalMinConverted.toLocaleString('da-DK')} – ${totalMaxConverted.toLocaleString('da-DK')} ${symbol}`;
    baseDisplay = baseMinConverted === baseMaxConverted
      ? `${baseMinConverted.toLocaleString('da-DK')} ${symbol}`
      : `${baseMinConverted.toLocaleString('da-DK')} – ${baseMaxConverted.toLocaleString('da-DK')} ${symbol}`;
    feeDisplay = `+${feeConverted.toLocaleString('da-DK')} ${symbol}`;
  } else {
    totalDisplay = totalMinConverted === totalMaxConverted
      ? `${symbol}${totalMinConverted.toLocaleString('en-US')}`
      : `${symbol}${totalMinConverted.toLocaleString('en-US')} – ${symbol}${totalMaxConverted.toLocaleString('en-US')}`;
    baseDisplay = baseMinConverted === baseMaxConverted
      ? `${symbol}${baseMinConverted.toLocaleString('en-US')}`
      : `${symbol}${baseMinConverted.toLocaleString('en-US')} – ${symbol}${baseMaxConverted.toLocaleString('en-US')}`;
    feeDisplay = `+${symbol}${feeConverted.toLocaleString('en-US')}`;
  }

  return {
    totalDisplay,
    totalMinConverted,
    totalMaxConverted,
    baseDisplay,
    feeDisplay,
    feeJpy,
    hasFee,
    feeLabel,
    feeDetails,
  };
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
