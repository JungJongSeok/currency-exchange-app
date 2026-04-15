import type {FavoritePair} from '../../domain/models/Currency';
import type {FavoritesRepository} from '../../domain/repositories/FavoritesRepository';
import {FAVORITES_CAP, MMKV_KEY} from '../config';
import {currencyStorage} from '../storage/mmkvStorage';

/**
 * MMKV-backed favorites repo. Capped at 20 pairs, unique by (from, to).
 */
export class MmkvFavoritesRepository implements FavoritesRepository {
  async list(): Promise<ReadonlyArray<FavoritePair>> {
    const raw = currencyStorage.getString(MMKV_KEY.favoritesList);
    if (raw == null) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ReadonlyArray<FavoritePair>;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  }

  async add(
    pair: Omit<FavoritePair, 'id' | 'createdAt'>,
  ): Promise<FavoritePair> {
    const current = await this.list();
    const existing = current.find(
      entry => entry.from === pair.from && entry.to === pair.to,
    );
    if (existing != null) {
      return existing;
    }
    const entry: FavoritePair = {
      id: `fav_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`,
      from: pair.from,
      to: pair.to,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...current].slice(0, FAVORITES_CAP);
    currencyStorage.set(MMKV_KEY.favoritesList, JSON.stringify(next));
    return entry;
  }

  async remove(id: string): Promise<void> {
    const current = await this.list();
    const next = current.filter(entry => entry.id !== id);
    currencyStorage.set(MMKV_KEY.favoritesList, JSON.stringify(next));
  }
}
