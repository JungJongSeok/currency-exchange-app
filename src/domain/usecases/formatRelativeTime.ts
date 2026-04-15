/**
 * formatRelativeTime — pure relative-time formatter.
 *
 * Returns a Korean short phrase ("방금", "5분 전", "2시간 전", "3일 전") given
 * an ISO-8601 timestamp and the current time in ms. Handles future timestamps
 * (clock skew) by clamping to "방금".
 *
 * For other languages, use `relativeTimeDescriptor` and translate via i18n:
 *   const d = relativeTimeDescriptor(iso, Date.now());
 *   t(`exchange.relativeTime.${d.kind}`, {value: d.value});
 */

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export type RelativeTimeKind = 'justNow' | 'minutes' | 'hours' | 'days';

export interface RelativeTimeDescriptor {
  readonly kind: RelativeTimeKind;
  /** Integer quantity; always `0` for `justNow`. */
  readonly value: number;
}

export const relativeTimeDescriptor = (
  fetchedAtIso: string,
  nowMs: number,
): RelativeTimeDescriptor => {
  const fetchedMs = Date.parse(fetchedAtIso);
  if (Number.isNaN(fetchedMs)) {
    return {kind: 'justNow', value: 0};
  }
  const deltaMs = nowMs - fetchedMs;
  if (deltaMs < MS_PER_MINUTE) {
    // Includes negative (future) timestamps caused by clock skew.
    return {kind: 'justNow', value: 0};
  }
  if (deltaMs < MS_PER_HOUR) {
    return {kind: 'minutes', value: Math.floor(deltaMs / MS_PER_MINUTE)};
  }
  if (deltaMs < MS_PER_DAY) {
    return {kind: 'hours', value: Math.floor(deltaMs / MS_PER_HOUR)};
  }
  return {kind: 'days', value: Math.floor(deltaMs / MS_PER_DAY)};
};

export const formatRelativeTime = (
  fetchedAtIso: string,
  nowMs: number,
): string => {
  const d = relativeTimeDescriptor(fetchedAtIso, nowMs);
  switch (d.kind) {
    case 'justNow':
      return '방금';
    case 'minutes':
      return `${d.value}분 전`;
    case 'hours':
      return `${d.value}시간 전`;
    case 'days':
      return `${d.value}일 전`;
  }
};
