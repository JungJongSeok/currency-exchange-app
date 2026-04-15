import type {RecentLookup} from '../../domain/models/Currency';
import type {LookupHistoryRepository} from '../../domain/repositories/LookupHistoryRepository';
import {HISTORY_CAP, MMKV_KEY} from '../config';
import {currencyStorage} from '../storage/mmkvStorage';

/**
 * MMKV-backed history repo. Capped at 10 entries, newest-first.
 */
export class MmkvLookupHistoryRepository implements LookupHistoryRepository {
  async list(): Promise<ReadonlyArray<RecentLookup>> {
    const raw = currencyStorage.getString(MMKV_KEY.historyList);
    if (raw == null) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as ReadonlyArray<RecentLookup>;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  }

  async add(entry: RecentLookup): Promise<void> {
    const current = await this.list();
    const deduped = current.filter(
      existing =>
        !(
          existing.from === entry.from &&
          existing.to === entry.to &&
          existing.amount === entry.amount
        ),
    );
    const next: ReadonlyArray<RecentLookup> = [entry, ...deduped].slice(
      0,
      HISTORY_CAP,
    );
    currencyStorage.set(MMKV_KEY.historyList, JSON.stringify(next));
  }

  async clear(): Promise<void> {
    currencyStorage.remove(MMKV_KEY.historyList);
  }
}
