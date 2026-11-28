import assert from "node:assert/strict";
import test from "node:test";
import type {
  PlayoffMatchup,
  PlayoffRound,
  PlayoffByeTeam,
} from "../types/playoffs";
import {
  BRACKET_CARD_HEIGHT,
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
  getBracketLayout,
} from "../utils/playoffs/bracketLayout";
import {
  getDefaultPlayoffSeason,
  getPlayoffSeasonLabel,
  PLAYOFF_ENDPOINTS,
} from "../utils/playoffs/playoffConfig";

const matchup = (
  id: string | null,
  nextSeriesId: string | null = null,
): PlayoffMatchup => ({
  id,
  nextSeriesId,
  name: "Matchup",
  league: null,
  bestOf: 7,
  status: "scheduled",
  winnerId: null,
  winnerAltId: null,
  teams: [null, null],
  games: [],
});
const round = (
  id: string,
  order: number,
  matchups: PlayoffMatchup[],
  byeTeams?: PlayoffByeTeam[],
): PlayoffRound => ({ id, order, name: id, matchups, byeTeams });

test("connects and centers later rounds without overlapping sibling cards", () => {
  const result = getBracketLayout([
    round("1", 1, [
      matchup("a", "e"),
      matchup("b", "e"),
      matchup("c", "f"),
      matchup("d", "f"),
    ]),
    round("2", 2, [matchup("e", "g"), matchup("f", "g")]),
    round("3", 3, [matchup("g")]),
  ]);
  const find = (id: string) =>
    result.nodes.find((node) => node.matchup?.id === id)!;
  assert.equal(find("e").y, (find("a").y + find("b").y) / 2);
  assert.equal(find("g").y, (find("e").y + find("f").y) / 2);
  assert.equal(find("a").nextKey, find("e").key);
  for (const column of new Set(result.nodes.map((node) => node.x))) {
    const nodes = result.nodes
      .filter((node) => node.x === column)
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < nodes.length; i++)
      assert.ok(nodes[i].y >= nodes[i - 1].y + BRACKET_CARD_HEIGHT);
  }
});
test("lays out NFL byes alongside Wild Card games and links them to the divisional round", () => {
  const bye: PlayoffByeTeam = {
    id: 7,
    alt_id: "1400",
    name: "Broncos",
    fullName: null,
    shortName: null,
    code: "DEN",
    logo: null,
    logoDark: null,
    wins: 0,
    isWinner: false,
    nextSeriesId: "div",
  };
  const result = getBracketLayout([
    round("wc", 1, [matchup("wc1", "div")], [bye]),
    round("div", 2, [matchup("div")]),
  ]);
  const source = result.nodes.find((node) => node.bye)!;
  const target = result.nodes.find((node) => node.matchup?.id === "div")!;
  assert.equal(source.nextKey, target.key);
  assert.notEqual(
    source.x,
    result.nodes.find((node) => node.matchup?.id === "wc1")!.x,
  );
});
test("sorts rounds without mutating input and keeps missing links disconnected", () => {
  const rounds = [
    round("last", 2, [matchup("final")]),
    round("first", 1, [matchup(null, "unknown"), matchup(null)]),
  ];
  const result = getBracketLayout(rounds);
  assert.equal(rounds[0].id, "last");
  assert.equal(result.rounds[0].id, "first");
  assert.equal(new Set(result.nodes.map((node) => node.key)).size, 3);
  assert.ok(result.nodes.every((node) => node.nextKey === null));
});
test("handles empty playoff rounds without invalid geometry", () => {
  const result = getBracketLayout([]);
  assert.deepEqual(result.nodes, []);
  assert.ok(result.height > 0 && result.width > 0);
});
test("uses correct season conventions for each provider", () => {
  const january = new Date("2026-01-15T00:00:00Z");
  assert.equal(getDefaultPlayoffSeason("nfl", january), 2025);
  assert.equal(
    getDefaultPlayoffSeason("nfl", new Date("2026-11-15T00:00:00Z")),
    2025,
  );
  assert.equal(getDefaultPlayoffSeason("nba", january), 2025);
  assert.equal(getDefaultPlayoffSeason("nhl", january), 2026);
  assert.equal(getDefaultPlayoffSeason("mlb", january), 2026);
  assert.equal(getPlayoffSeasonLabel("nba", 2025), "2025–26");
  assert.equal(getPlayoffSeasonLabel("nhl", 2026), "2025–26");
  assert.equal(Object.keys(PLAYOFF_ENDPOINTS).length, 5);
});

test("conference branches face a centered championship from both sides", () => {
  const result = getBracketLayout([
    round("first", 1, [
      { ...matchup("east", "final"), league: "East" },
      { ...matchup("west", "final"), league: "West" },
    ]),
    round("final", 2, [matchup("final")]),
  ]);
  const left = result.nodes.find((node) => node.matchup?.id === "east")!;
  const right = result.nodes.find((node) => node.matchup?.id === "west")!;
  const final = result.nodes.find((node) => node.matchup?.id === "final")!;
  assert.ok(left.x < final.x && right.x > final.x);
  assert.equal(final.x + BRACKET_CARD_WIDTH / 2, result.width / 2);
  assert.equal(
    final.y + BRACKET_CARD_HEIGHT / 2,
    (result.height - BRACKET_HEADER_HEIGHT) / 2,
  );
  assert.equal(left.nextKey, final.key);
  assert.equal(right.nextKey, final.key);
  assert.equal(result.headers.length, 3);
});
