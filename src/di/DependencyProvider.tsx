import React, {createContext, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';

import {FrankfurterCurrencyDataSource} from '../data/datasources/FrankfurterCurrencyDataSource';
import {MmkvRateCacheDataSource} from '../data/datasources/MmkvRateCacheDataSource';
import {FrankfurterCurrencyRepository} from '../data/repositories/FrankfurterCurrencyRepository';
import {MmkvFavoritesRepository} from '../data/repositories/MmkvFavoritesRepository';
import {MmkvLookupHistoryRepository} from '../data/repositories/MmkvLookupHistoryRepository';
import type {CurrencyRepository} from '../domain/repositories/CurrencyRepository';
import type {FavoritesRepository} from '../domain/repositories/FavoritesRepository';
import type {LookupHistoryRepository} from '../domain/repositories/LookupHistoryRepository';
import {
  setCurrencyRepository,
  setFavoritesRepository,
  setLookupHistoryRepository,
} from '../store/repositoryRefs';

export interface Dependencies {
  readonly currencyRepository: CurrencyRepository;
  readonly lookupHistoryRepository: LookupHistoryRepository;
  readonly favoritesRepository: FavoritesRepository;
}

const DependencyContext = createContext<Dependencies | null>(null);

export interface DependencyProviderProps {
  readonly children: ReactNode;
  readonly overrides?: Partial<Dependencies>;
}

export const DependencyProvider = ({
  children,
  overrides,
}: DependencyProviderProps): React.JSX.Element => {
  const dependencies = useMemo<Dependencies>(() => {
    const api = new FrankfurterCurrencyDataSource();
    const rateCache = new MmkvRateCacheDataSource();
    const currencyRepository: CurrencyRepository =
      overrides?.currencyRepository ??
      new FrankfurterCurrencyRepository(api, rateCache);
    const lookupHistoryRepository: LookupHistoryRepository =
      overrides?.lookupHistoryRepository ?? new MmkvLookupHistoryRepository();
    const favoritesRepository: FavoritesRepository =
      overrides?.favoritesRepository ?? new MmkvFavoritesRepository();
    return {currencyRepository, lookupHistoryRepository, favoritesRepository};
  }, [overrides]);

  useEffect(() => {
    setCurrencyRepository(dependencies.currencyRepository);
    setLookupHistoryRepository(dependencies.lookupHistoryRepository);
    setFavoritesRepository(dependencies.favoritesRepository);
  }, [dependencies]);

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = (): Dependencies => {
  const ctx = useContext(DependencyContext);
  if (ctx == null) {
    throw new Error('useDependencies must be used within DependencyProvider');
  }
  return ctx;
};
