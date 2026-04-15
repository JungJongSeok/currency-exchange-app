import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  CurrencyCode,
  CurrencyInfo,
  ExchangeRate,
  ExchangeState,
  FavoritePair,
  RecentLookup,
} from '../domain/models/Currency';
import {convertAmount} from '../domain/usecases/convertAmount';
import {generateLookupId} from '../domain/usecases/generateLookupId';
import {
  getCurrencyRepository,
  getFavoritesRepository,
  getLookupHistoryRepository,
} from './repositoryRefs';

export interface CurrencyState {
  currencies: CurrencyInfo[];
  currenciesLoaded: boolean;
  selectedFrom: CurrencyCode;
  selectedTo: CurrencyCode;
  amount: number;
  exchangeState: ExchangeState;
  history: RecentLookup[];
  favorites: FavoritePair[];
}

const initialState: CurrencyState = {
  currencies: [],
  currenciesLoaded: false,
  selectedFrom: 'USD',
  selectedTo: 'KRW',
  amount: 1,
  exchangeState: {kind: 'idle'},
  history: [],
  favorites: [],
};

export const loadCurrencies = createAsyncThunk<ReadonlyArray<CurrencyInfo>>(
  'currency/loadCurrencies',
  async () => {
    return getCurrencyRepository().listCurrencies();
  },
);

export const loadHistory = createAsyncThunk<ReadonlyArray<RecentLookup>>(
  'currency/loadHistory',
  async () => {
    return getLookupHistoryRepository().list();
  },
);

export const loadFavorites = createAsyncThunk<ReadonlyArray<FavoritePair>>(
  'currency/loadFavorites',
  async () => {
    return getFavoritesRepository().list();
  },
);

export interface ConvertPayload {
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  readonly amount: number;
}

interface ConvertResultPayload {
  readonly rate: ExchangeRate;
  readonly input: number;
  readonly output: number;
}

export const convert = createAsyncThunk<ConvertResultPayload, ConvertPayload>(
  'currency/convert',
  async ({from, to, amount}) => {
    const rate = await getCurrencyRepository().getRate(from, to);
    const output = convertAmount(amount, rate.rate);
    return {rate, input: amount, output};
  },
);

export const addToHistory = createAsyncThunk<
  ReadonlyArray<RecentLookup>,
  {
    readonly from: CurrencyCode;
    readonly to: CurrencyCode;
    readonly amount: number;
    readonly result: number;
  }
>('currency/addToHistory', async payload => {
  const repo = getLookupHistoryRepository();
  const entry: RecentLookup = {
    id: generateLookupId(),
    from: payload.from,
    to: payload.to,
    amount: payload.amount,
    result: payload.result,
    lookupAt: new Date().toISOString(),
  };
  await repo.add(entry);
  return repo.list();
});

export const addFavorite = createAsyncThunk<
  ReadonlyArray<FavoritePair>,
  {readonly from: CurrencyCode; readonly to: CurrencyCode}
>('currency/addFavorite', async pair => {
  const repo = getFavoritesRepository();
  await repo.add(pair);
  return repo.list();
});

export const removeFavorite = createAsyncThunk<
  ReadonlyArray<FavoritePair>,
  string
>('currency/removeFavorite', async id => {
  const repo = getFavoritesRepository();
  await repo.remove(id);
  return repo.list();
});

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    fromChanged(state, action: PayloadAction<CurrencyCode>) {
      state.selectedFrom = action.payload;
      state.exchangeState = {kind: 'idle'};
    },
    toChanged(state, action: PayloadAction<CurrencyCode>) {
      state.selectedTo = action.payload;
      state.exchangeState = {kind: 'idle'};
    },
    pairSwapped(state) {
      const {selectedFrom, selectedTo} = state;
      state.selectedFrom = selectedTo;
      state.selectedTo = selectedFrom;
      state.exchangeState = {kind: 'idle'};
    },
    amountChanged(state, action: PayloadAction<number>) {
      state.amount = action.payload;
      state.exchangeState = {kind: 'idle'};
    },
    pairRestored(
      state,
      action: PayloadAction<{
        readonly from: CurrencyCode;
        readonly to: CurrencyCode;
        readonly amount?: number;
      }>,
    ) {
      state.selectedFrom = action.payload.from;
      state.selectedTo = action.payload.to;
      if (action.payload.amount != null) {
        state.amount = action.payload.amount;
      }
      state.exchangeState = {kind: 'idle'};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadCurrencies.fulfilled, (state, action) => {
        state.currencies = [...action.payload];
        state.currenciesLoaded = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.history = [...action.payload];
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.favorites = [...action.payload];
      })
      .addCase(convert.pending, state => {
        state.exchangeState = {kind: 'loading'};
      })
      .addCase(convert.fulfilled, (state, action) => {
        state.exchangeState = {
          kind: 'ready',
          result: {
            input: action.payload.input,
            output: action.payload.output,
            rate: action.payload.rate,
          },
        };
      })
      .addCase(convert.rejected, (state, action) => {
        state.exchangeState = {
          kind: 'error',
          message: action.error.message ?? 'Conversion failed',
        };
      })
      .addCase(addToHistory.fulfilled, (state, action) => {
        state.history = [...action.payload];
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favorites = [...action.payload];
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = [...action.payload];
      });
  },
});

export const {
  fromChanged,
  toChanged,
  pairSwapped,
  amountChanged,
  pairRestored,
} = currencySlice.actions;

export default currencySlice.reducer;
