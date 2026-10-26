import { isAxiosError } from "axios";
import type { ResultItem, SearchAffiliation } from "types/explore";
import { normalizeExploreSearchQuery } from "utils/explore/exploreSearch";

export type ExploreSearchAnalyticsScope = "all" | "players" | "teams" | "users";

export type ExploreSearchImpression = {
  entityType: ResultItem["type"];
  affiliation: SearchAffiliation | null;
  entityId: string;
  position: number;
  matchClass: ResultItem["matchClass"];
  textScore: number;
  active: boolean | null;
};

export type ExploreSearchSourceTiming = {
  durationMs: number;
  queryCount: number;
};

export type ExploreSearchMetadata = {
  searchRequestId: string;
  rankingVersion: string;
  serverDurationMs: number;
  cacheHit: boolean;
  sourceTimings: {
    players: ExploreSearchSourceTiming;
    teams: ExploreSearchSourceTiming;
    users: ExploreSearchSourceTiming;
  };
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
  searchRequestId: string;
  rankingVersion: string;
  serverDurationMs: number;
  sourceTimings: ExploreSearchMetadata["sourceTimings"];
  cacheHit: boolean;
};

export type ExploreSearchResultSelectedEvent = ExploreSearchEventBase & {
  eventType: "search_result_selected";
  entityType: ResultItem["type"];
  affiliation: SearchAffiliation | null;
  entityId: string;
  position: number;
  searchRequestId: string;
  attributedEventId: string;
  rankingVersion: string;
  matchClass: ResultItem["matchClass"];
  textScore: number;
};

export type ExploreSearchEvent =
  | ExploreSearchSettledEvent
  | ExploreSearchResultSelectedEvent;

export type ExploreSearchEventBatch = { events: ExploreSearchEvent[] };

type EventPayload = ExploreSearchEvent | ExploreSearchEventBatch;
type EventSender = (payload: EventPayload) => Promise<unknown>;

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
    matchClass: item.matchClass,
    textScore: item.textScore,
    active:
      item.type === "player"
        ? (item.active ?? null)
        : item.type === "team"
          ? (item.is_active ?? null)
          : null,
  };
}

export function buildExploreSearchSettledEvent({
  searchSessionId,
  query,
  scope,
  results,
  durationMs,
  searchMetadata,
}: {
  searchSessionId: string;
  query: string;
  scope: ExploreSearchAnalyticsScope;
  results: ResultItem[];
  durationMs: number;
  searchMetadata: ExploreSearchMetadata;
}): ExploreSearchSettledEvent {
  return {
    eventId: createExploreSearchAnalyticsId(),
    eventType: "search_settled",
    searchSessionId,
    normalizedQuery: normalizeExploreAnalyticsQuery(query),
    scope,
    resultCount: results.length,
    durationMs: Math.max(0, Math.round(durationMs)),
    searchRequestId: searchMetadata.searchRequestId,
    rankingVersion: searchMetadata.rankingVersion,
    serverDurationMs: searchMetadata.serverDurationMs,
    sourceTimings: searchMetadata.sourceTimings,
    cacheHit: searchMetadata.cacheHit,
    // Positions are deliberately one-based to match product analytics reports.
    results: results.map((item, index) =>
      getExploreSearchImpression(item, index + 1),
    ),
  };
}

export function buildExploreSearchSelectionEvent({
  attributedEvent,
  item,
  position,
}: {
  attributedEvent: ExploreSearchSettledEvent;
  item: ResultItem;
  position: number;
}): ExploreSearchResultSelectedEvent {
  const impression = getExploreSearchImpression(item, position);
  return {
    eventId: createExploreSearchAnalyticsId(),
    eventType: "search_result_selected",
    searchSessionId: attributedEvent.searchSessionId,
    normalizedQuery: attributedEvent.normalizedQuery,
    scope: attributedEvent.scope,
    entityType: impression.entityType,
    affiliation: impression.affiliation,
    entityId: impression.entityId,
    position: impression.position,
    searchRequestId: attributedEvent.searchRequestId,
    attributedEventId: attributedEvent.eventId,
    rankingVersion: attributedEvent.rankingVersion,
    matchClass: impression.matchClass,
    textScore: impression.textScore,
  };
}

const postEvent: EventSender = async (payload) => {
  // Loading the shared client lazily keeps the event-model helpers portable in
  // unit tests while preserving the app's canonical auth/refresh behavior.
  const { apiClient } = await import("utils/apiClient");
  return apiClient.post("/api/explore/search/events", payload);
};

export function sendExploreSearchEvent(
  event: ExploreSearchEvent,
  sender: EventSender = postEvent,
): void {
  void sender(event).catch((error: unknown) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      const reason = isAxiosError<{ error?: string }>(error)
        ? (error.response?.data?.error ?? error.message)
        : error;
      console.warn("Explore search analytics event was dropped", reason);
    }
  });
}

export function sendExploreSearchEvents(
  events: ExploreSearchEvent[],
  sender: EventSender = postEvent,
): void {
  void sender({ events }).catch((error: unknown) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      const reason = isAxiosError<{ error?: string }>(error)
        ? (error.response?.data?.error ?? error.message)
        : error;
      console.warn("Explore search analytics event batch was dropped", reason);
    }
  });
}
