import { Restaurant } from '../types';

export interface ParetoConfig {
  considerTabelog: boolean;
  considerMichelin: boolean;
  considerPrice: boolean;
  considerLanguage: boolean;
}

export const DEFAULT_PARETO_CONFIG: ParetoConfig = {
  considerTabelog: true,
  considerMichelin: true,
  considerPrice: true,
  considerLanguage: false,
};

function getStarValue(stars: Restaurant['stars']): number {
  if (stars === 3) return 3;
  if (stars === 2) return 2;
  if (stars === 1) return 1;
  return 0.5; // Bib Gourmand
}

function getLanguageScore(advisability: Restaurant['languageAdvisability']): number {
  if (advisability.startsWith('Welcoming')) return 3;
  if (advisability.startsWith('Friendly')) return 2;
  return 1;
}

/**
 * Checks if restaurant A dominates restaurant B.
 * Dominates means A is at least as good in all objectives, and strictly better in at least one.
 */
export function dominates(a: Restaurant, b: Restaurant, config: ParetoConfig = DEFAULT_PARETO_CONFIG): boolean {
  let atLeastAsGoodInAll = true;
  let strictlyBetterInAtLeastOne = false;

  // Objective 1: Tabelog Score (Maximize)
  if (config.considerTabelog) {
    if (a.tabelogScore < b.tabelogScore) {
      return false;
    }
    if (a.tabelogScore > b.tabelogScore) {
      strictlyBetterInAtLeastOne = true;
    }
  }

  // Objective 2: Michelin Stars (Maximize)
  if (config.considerMichelin) {
    const starA = getStarValue(a.stars);
    const starB = getStarValue(b.stars);
    if (starA < starB) {
      return false;
    }
    if (starA > starB) {
      strictlyBetterInAtLeastOne = true;
    }
  }

  // Objective 3: Price in DKK / JPY for two (Minimize)
  if (config.considerPrice) {
    const priceA = a.price.dinnerMin;
    const priceB = b.price.dinnerMin;
    if (priceA > priceB) {
      return false;
    }
    if (priceA < priceB) {
      strictlyBetterInAtLeastOne = true;
    }
  }

  // Objective 4: Language Friendliness (Maximize)
  if (config.considerLanguage) {
    const langA = getLanguageScore(a.languageAdvisability);
    const langB = getLanguageScore(b.languageAdvisability);
    if (langA < langB) {
      return false;
    }
    if (langA > langB) {
      strictlyBetterInAtLeastOne = true;
    }
  }

  return atLeastAsGoodInAll && strictlyBetterInAtLeastOne;
}

/**
 * Computes the Pareto frontier set of restaurants from the input array.
 */
export function computeParetoFront(
  restaurants: Restaurant[],
  config: ParetoConfig = DEFAULT_PARETO_CONFIG
): Set<string> {
  const paretoIds = new Set<string>();

  for (let i = 0; i < restaurants.length; i++) {
    const candidate = restaurants[i];
    let isDominated = false;

    for (let j = 0; j < restaurants.length; j++) {
      if (i === j) continue;
      const other = restaurants[j];

      if (dominates(other, candidate, config)) {
        isDominated = true;
        break;
      }
    }

    if (!isDominated) {
      paretoIds.add(candidate.id);
    }
  }

  return paretoIds;
}
