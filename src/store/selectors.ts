import type {
  CurrencyCode,
  CurrencyInfo,
  ExchangeState,
  FavoritePair,
  RecentLookup,
} from '../domain/models/Currency';
import type {RootState} from './store';

export const selectCurrencies = (
  state: RootState,
): ReadonlyArray<CurrencyInfo> => state.currency.currencies;

export const selectCurrenciesLoaded = (state: RootState): boolean =>
  state.currency.currenciesLoaded;

export const selectSelectedFrom = (state: RootState): CurrencyCode =>
  state.currency.selectedFrom;

export const selectSelectedTo = (state: RootState): CurrencyCode =>
  state.currency.selectedTo;

export const selectSelectedPair = (
  state: RootState,
): {readonly from: CurrencyCode; readonly to: CurrencyCode} => ({
  from: state.currency.selectedFrom,
  to: state.currency.selectedTo,
});

export const selectCurrentAmount = (state: RootState): number =>
  state.currency.amount;

export const selectExchangeState = (state: RootState): ExchangeState =>
  state.currency.exchangeState;

export const selectHistory = (state: RootState): ReadonlyArray<RecentLookup> =>
  state.currency.history;

export const selectFavorites = (
  state: RootState,
): ReadonlyArray<FavoritePair> => state.currency.favorites;

export const selectIsFavorited = (state: RootState): boolean => {
  const {selectedFrom, selectedTo, favorites} = state.currency;
  return favorites.some(
    fav => fav.from === selectedFrom && fav.to === selectedTo,
  );
};

export const selectCurrentFavoriteId = (state: RootState): string | null => {
  const {selectedFrom, selectedTo, favorites} = state.currency;
  const match = favorites.find(
    fav => fav.from === selectedFrom && fav.to === selectedTo,
  );
  return match?.id ?? null;
};
