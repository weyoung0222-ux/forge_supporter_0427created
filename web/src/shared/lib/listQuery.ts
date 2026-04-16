/**
 * 목록 검색/정렬용 공통 유틸 (@docs/forge.md — shared/lib)
 */

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(haystack: string, query: string): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) {
    return true;
  }
  return haystack.toLowerCase().includes(q);
}
