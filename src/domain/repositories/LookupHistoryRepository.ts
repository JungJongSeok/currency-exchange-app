import type {RecentLookup} from '../models/Currency';

/**
 * Repository contract for the "recent lookups" log.
 *
 * Semantics (enforced by implementation):
 *   - Cap 10 entries, FIFO drop (newest first).
 *   - `add` pushes an already-constructed entry (id/lookupAt pre-generated).
 */
export interface LookupHistoryRepository {
  list(): Promise<ReadonlyArray<RecentLookup>>;
  add(entry: RecentLookup): Promise<void>;
  clear(): Promise<void>;
}
