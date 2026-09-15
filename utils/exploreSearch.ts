import type { ResultItem } from "../types/explore";

export const EXPLORE_SEARCH_MIN_QUERY_LENGTH = 2;
export const EXPLORE_SEARCH_MAX_QUERY_LENGTH = 80;

export function normalizeExploreSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function canSearchExploreQuery(query: string): boolean {
  const length = normalizeExploreSearchQuery(query).length;
  return (
    length >= EXPLORE_SEARCH_MIN_QUERY_LENGTH &&
    length <= EXPLORE_SEARCH_MAX_QUERY_LENGTH
  );
}

export function getExploreResultIdentity(item: ResultItem): string {
  if (item.type === "user") return `user:${item.id}`;
  return `${item.type}:${item.affiliation}:${item.id}`;
}
