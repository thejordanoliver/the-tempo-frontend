import type { ResultItem, SearchAffiliation } from "types/explore";
import { normalizeExploreSearchQuery } from "utils/exploreSearch";

export type ExploreSearchAnalyticsScope =
  | "all"
  | "players"
  | "teams"
  | "users";

export type ExploreSearchImpression = {
  entityType: ResultItem["type"];
  affiliation: SearchAffiliation | null;
  entityId: string;
  position: number;
};

type ExploreSearchEventBase = {
  eventId: string;
  searchSessionId: string;
  normalizedQuery: string;
  scope: ExploreSearchAnalyticsScope;
};

export type ExploreSearchSettledEvent = ExploreSearchEventBase & {
  eventType: "search_settled";
  resultCount: number;
  durationMs: number;
  results: ExploreSearchImpression[];
};

export type ExploreSearchResultSelectedEvent = ExploreSearchEventBase & {
  eventType: "search_result_selected";
  entityType: ResultItem["type"];
  affiliation: SearchAffiliation | null;
  entityId: string;
  position: number;
};

export type ExploreSearchEvent =
  | ExploreSearchSettledEvent
  | ExploreSearchResultSelectedEvent;

type EventSender = (event: ExploreSearchEvent) => Promise<unknown>;

function createFallbackUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function createExploreSearchAnalyticsId(): string {
  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : createFallbackUuid();
}

export function normalizeExploreAnalyticsQuery(query: string): string {
  return normalizeExploreSearchQuery(query).toLocaleLowerCase();
}

export function getExploreSearchImpression(
  item: ResultItem,
  position: number,
): ExploreSearchImpression {
  return {
    entityType: item.type,
    affiliation: item.type === "user" ? null : item.affiliation,
    entityId: String(item.id),
    position,
  };
}

export function buildExploreSearchSettledEvent({
  searchSessionId,
  query,
  scope,
  results,
  durationMs,
}: {
  searchSessionId: string;
  query: string;
  scope: ExploreSearchAnalyticsScope;
  results: ResultItem[];
  durationMs: number;
}): ExploreSearchSettledEvent {
  return {
    eventId: createExploreSearchAnalyticsId(),
    eventType: "search_settled",
    searchSessionId,
    normalizedQuery: normalizeExploreAnalyticsQuery(query),
    scope,
    resultCount: results.length,
    durationMs: Math.max(0, Math.round(durationMs)),
    // Positions are deliberately one-based to match product analytics reports.
    results: results.map((item, index) =>
      getExploreSearchImpression(item, index + 1),
    ),
  };
}

export function buildExploreSearchSelectionEvent({
  searchSessionId,
  query,
  scope,
  item,
  position,
}: {
  searchSessionId: string;
  query: string;
  scope: ExploreSearchAnalyticsScope;
  item: ResultItem;
  position: number;
}): ExploreSearchResultSelectedEvent {
  return {
    eventId: createExploreSearchAnalyticsId(),
    eventType: "search_result_selected",
    searchSessionId,
    normalizedQuery: normalizeExploreAnalyticsQuery(query),
    scope,
    ...getExploreSearchImpression(item, position),
  };
}

const postEvent: EventSender = async (event) => {
  // Loading the shared client lazily keeps the event-model helpers portable in
  // unit tests while preserving the app's canonical auth/refresh behavior.
  const { apiClient } = await import("utils/apiClient");
  return apiClient.post("/api/explore/search/events", event);
};

export function sendExploreSearchEvent(
  event: ExploreSearchEvent,
  sender: EventSender = postEvent,
): void {
  void sender(event).catch((error: unknown) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("Explore search analytics event was dropped", error);
    }
  });
}
