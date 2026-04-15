import {generateLookupId} from './generateLookupId';

describe('generateLookupId', () => {
  it('Given 단일 호출 When 생성 Then lookup_ 접두사 포함', () => {
    const id = generateLookupId();
    expect(id.startsWith('lookup_')).toBe(true);
  });

  it('Given 단일 호출 When 생성 Then 포맷 lookup_{number}_{number}', () => {
    const id = generateLookupId();
    expect(id).toMatch(/^lookup_\d+_\d+$/);
  });

  it('Given 100회 연속 호출 When 생성 Then 모두 고유', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      ids.add(generateLookupId());
    }
    expect(ids.size).toBe(100);
  });
});
