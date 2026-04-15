import {createMMKV} from 'react-native-mmkv';

/**
 * Single MMKV instance for the currency exchange app. MMKV v4 API: use
 * `createMMKV({id})` (factory) and `.remove(key)`.
 */
export const currencyStorage = createMMKV({id: 'currency-exchange-storage'});
