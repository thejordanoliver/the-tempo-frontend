import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildExploreSearchSelectionEvent,
  buildExploreSearchSettledEvent,
  sendExploreSearchEvent,
  sendExploreSearchEvents,
} from "../services/exploreSearchAnalytics";
import type { ResultItem } from "../types/explore";

const player = {
  id: "4430841",
  type: "player",
  affiliation: "nfl",
  full_name: "Carson Beck",
  team_id: "1",
  headshot_url: null,
  nickname: null,
  association_name: null,
  position: "QB",
  matchClass: 2,
  textScore: 0.8,
  score: 0.8,
} satisfies ResultItem;

const searchMetadata = {
  searchRequestId: "55555555-5555-4555-8555-555555555555",
  rankingVersion: "lexical-v1",
  serverDurationMs: 118,
  cacheHit: false,
  sourceTimings: {
    players: { durationMs: 117, queryCount: 1 },
    teams: { durationMs: 0, queryCount: 0 },
    users: { durationMs: 0, queryCount: 0 },
  },
};

test("settled events normalize queries and record one-based impressions", () => {
  const event = buildExploreSearchSettledEvent({
    searchSessionId: "11111111-1111-4111-8111-111111111111",
    query: "  CARSON   Beck ",
    scope: "players",
    results: [player],
    durationMs: 301.6,
    searchMetadata,
  });

  assert.equal(event.normalizedQuery, "carson beck");
  assert.equal(event.resultCount, 1);
  assert.equal(event.durationMs, 302);
  assert.deepEqual(event.results[0], {
    entityType: "player",
    affiliation: "nfl",
    entityId: "4430841",
    position: 1,
    matchClass: 2,
    textScore: 0.8,
    active: null,
  });
  assert.equal(event.searchRequestId, searchMetadata.searchRequestId);
  assert.deepEqual(event.sourceTimings, searchMetadata.sourceTimings);
});

test("selection events preserve collision-safe entity identity", () => {
  const attributedEvent = buildExploreSearchSettledEvent({
    searchSessionId: "11111111-1111-4111-8111-111111111111",
    query: "carson",
    scope: "all",
    results: [player],
    durationMs: 25,
    searchMetadata,
  });
  const event = buildExploreSearchSelectionEvent({
    attributedEvent,
    item: player,
    position: 1,
  });

  assert.equal(event.entityType, "player");
  assert.equal(event.affiliation, "nfl");
  assert.equal(event.entityId, "4430841");
  assert.equal(event.position, 1);
  assert.equal(event.searchRequestId, searchMetadata.searchRequestId);
  assert.equal(event.attributedEventId, attributedEvent.eventId);
  assert.equal(event.matchClass, 2);
  assert.equal(event.textScore, 0.8);
});

test("a rejected analytics request is swallowed", async () => {
  const event = buildExploreSearchSettledEvent({
    searchSessionId: "11111111-1111-4111-8111-111111111111",
    query: "carson",
    scope: "all",
    results: [],
    durationMs: 25,
    searchMetadata,
  });

  assert.doesNotThrow(() =>
    sendExploreSearchEvent(event, async () => {
      throw new Error("offline");
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
});

test("selection batches resend the attributed impression atomically", async () => {
  const settledEvent = buildExploreSearchSettledEvent({
    searchSessionId: "11111111-1111-4111-8111-111111111111",
    query: "carson",
    scope: "all",
    results: [player],
    durationMs: 25,
    searchMetadata,
  });
  const selectionEvent = buildExploreSearchSelectionEvent({
    attributedEvent: settledEvent,
    item: player,
    position: 1,
  });
  let payload: unknown;

  sendExploreSearchEvents([settledEvent, selectionEvent], async (value) => {
    payload = value;
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(payload, { events: [settledEvent, selectionEvent] });
});

test("analytics auth failures cannot trigger refresh navigation", () => {
  const apiClientSource = readFileSync(
    new URL("../utils/apiClient.ts", import.meta.url),
    "utf8",
  );

  assert.match(apiClientSource, /"\/api\/explore\/search\/events"/);
  assert.match(apiClientSource, /shouldSkipAuthRefresh\(requestUrl\)/);
});
