import type {FavoritePair} from '../models/Currency';

/**
 * Repository contract for the saved favorite currency pairs.
 *
 * Semantics:
 *   - Cap 20 pairs.
 *   - Unique by (from, to) — adding a duplicate returns the existing entry.
 */
export interface FavoritesRepository {
  list(): Promise<ReadonlyArray<FavoritePair>>;
  add(pair: Omit<FavoritePair, 'id' | 'createdAt'>): Promise<FavoritePair>;
  remove(id: string): Promise<void>;
}
