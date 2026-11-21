import assert from "node:assert/strict";
import test from "node:test";
import type { PlayoffLeague } from "../types/playoffs";
import {
  createPlaceholderBracket,
  withPlaceholderBracket,
} from "../utils/playoffs/placeholderBracket";
import { getBracketLayout } from "../utils/playoffs/bracketLayout";

const counts = {
  mlb: [4, 4, 2, 1],
  nba: [8, 4, 2, 1],
  wnba: [4, 2, 1],
  nfl: [6, 4, 2, 1],
  nhl: [8, 4, 2, 1],
};
for (const league of Object.keys(counts) as PlayoffLeague[]) {
  test(`${league} undecided bracket has full rounds, TBD slots and connected advancement`, () => {
    const bracket = createPlaceholderBracket(league, 2031);
    assert.deepEqual(
      bracket.rounds.map((round) => round.matchups.length),
      counts[league],
    );
    const layout = getBracketLayout(bracket.rounds);
    const byKey = new Map(layout.nodes.map((node) => [node.key, node]));
    for (const node of layout.nodes) {
      if (node.matchup) {
        assert.deepEqual(node.matchup.teams, [null, null]);
        assert.equal(node.matchup.status, "scheduled");
        assert.equal(node.matchup.winnerId, null);
        assert.deepEqual(node.matchup.games, []);
      }
      if (node.roundIndex < bracket.rounds.length - 1)
        assert.equal(byKey.get(node.nextKey!)?.roundIndex, node.roundIndex + 1);
      else assert.equal(node.nextKey, null);
    }
    const byes = bracket.rounds[0].byeTeams ?? [];
    assert.equal(byes.length, league === "mlb" ? 4 : league === "nfl" ? 2 : 0);
    assert.ok(
      byes.every(
        (team) =>
          team?.id === null && team.code === "TBD" && team.logo === null,
      ),
    );
    assert.equal(bracket.rounds.at(-1)!.matchups[0].league, null);
  });
}
test("fills empty upcoming responses without mutating the backend payload", () => {
  const empty = { season: 2031, rounds: [] };
  assert.equal(
    withPlaceholderBracket("nhl", empty, new Date("2030-11-15")).rounds.length,
    4,
  );
  assert.deepEqual(empty.rounds, []);
});
test("keeps historical empty responses and actual matchup data intact", () => {
  const old = { season: 2020, rounds: [] };
  assert.equal(withPlaceholderBracket("nba", old, new Date("2030-11-15")), old);
  const populated = createPlaceholderBracket("nba", 2031);
  assert.equal(withPlaceholderBracket("nba", populated), populated);
});

test("WNBA placeholders follow seeding without conference labels", () => {
  const bracket = createPlaceholderBracket("wnba", 2027);
  assert.deepEqual(
    bracket.rounds.map((round) => round.matchups[0].bestOf),
    [3, 5, 7],
  );
  assert.ok(
    bracket.rounds.every((round) =>
      round.matchups.every((matchup) => matchup.league === null),
    ),
  );
});
