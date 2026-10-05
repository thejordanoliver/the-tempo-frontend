import assert from "node:assert/strict";
import test from "node:test";
import type {
  BracketApiResponse,
  NFLPlayoffGame,
} from "../types/football/football";
import {
  findNextRoundIndex,
  getGamesByWeek,
  getRoundConferenceGames,
  orderWildCardGamesForBracket,
} from "../utils/nflBracketUtils";

const game = (id: number, home: number, away: number, headline = "") =>
  ({
    id,
    date: "2026-01-10T12:00:00Z",
    headline,
    home: { id: home, espnId: home, code: home > 0 ? `T${home}` : "TBD" },
    away: { id: away, espnId: away, code: away > 0 ? `T${away}` : "TBD" },
  }) as NFLPlayoffGame;

test("orders wild cards by their divisional target and keeps unmatched games last", () => {
  const first = game(1, 2, 7);
  const second = game(2, 3, 6);
  const unknown = game(3, 0, 0);
  const input = [second, unknown, first];
  const divisional = [game(4, 1, 7), game(5, 3, 4)];
  assert.deepEqual(orderWildCardGamesForBracket(input, divisional), [
    first,
    second,
    unknown,
  ]);
  assert.deepEqual(input, [second, unknown, first]);
  assert.equal(findNextRoundIndex(unknown, divisional), null);
});

test("uses the winner to resolve a next-round matchup before either participant", () => {
  const source = game(1, 2, 7);
  source.away.winner = true;
  assert.equal(findNextRoundIndex(source, [game(2, 2, 3), game(3, 1, 7)]), 1);
});

test("splits scheduled untagged games while respecting conference headlines", () => {
  const games = [game(4, 0, 0), game(2, 0, 0), game(1, 0, 0), game(3, 0, 0)];
  assert.deepEqual(
    getRoundConferenceGames(games, "AFC", 2).map((g) => g.id),
    [1, 2],
  );
  assert.deepEqual(
    getRoundConferenceGames(games, "NFC", 2).map((g) => g.id),
    [3, 4],
  );
  games[0].headline = "AFC Divisional Playoff";
  assert.deepEqual(getRoundConferenceGames(games, "AFC", 2), [games[0]]);
});

test("prefers grouped round games and falls back to the flat schedule", () => {
  const grouped = game(1, 2, 7);
  const flat = game(2, 3, 6);
  flat.week = { number: 1 } as NFLPlayoffGame["week"];
  const bracket = {
    games: [flat],
    groups: [{ week: { number: 1 }, games: [grouped] }],
  } as BracketApiResponse;
  assert.deepEqual(getGamesByWeek(bracket, 1), [grouped]);
  assert.deepEqual(getGamesByWeek({ ...bracket, groups: [] }, 1), [flat]);
  assert.deepEqual(getGamesByWeek(null, 1), []);
});
