/**
 * Module-level repository references injected at app boot by
 * DependencyProvider. Async thunks read from here.
 */

import type {CurrencyRepository} from '../domain/repositories/CurrencyRepository';
import type {FavoritesRepository} from '../domain/repositories/FavoritesRepository';
import type {LookupHistoryRepository} from '../domain/repositories/LookupHistoryRepository';

let currencyRepoRef: CurrencyRepository | null = null;
let historyRepoRef: LookupHistoryRepository | null = null;
let favoritesRepoRef: FavoritesRepository | null = null;

export const setCurrencyRepository = (repo: CurrencyRepository): void => {
  currencyRepoRef = repo;
};

export const getCurrencyRepository = (): CurrencyRepository => {
  if (currencyRepoRef == null) {
    throw new Error('CurrencyRepository not initialised');
  }
  return currencyRepoRef;
};

export const setLookupHistoryRepository = (
  repo: LookupHistoryRepository,
): void => {
  historyRepoRef = repo;
};

export const getLookupHistoryRepository = (): LookupHistoryRepository => {
  if (historyRepoRef == null) {
    throw new Error('LookupHistoryRepository not initialised');
  }
  return historyRepoRef;
};

export const setFavoritesRepository = (repo: FavoritesRepository): void => {
  favoritesRepoRef = repo;
};

export const getFavoritesRepository = (): FavoritesRepository => {
  if (favoritesRepoRef == null) {
    throw new Error('FavoritesRepository not initialised');
  }
  return favoritesRepoRef;
};
