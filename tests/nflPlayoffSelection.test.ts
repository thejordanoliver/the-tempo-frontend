import assert from "node:assert/strict";
import test from "node:test";
import { selectNFLSuperBowl } from "../utils/nflPlayoffSelection";
import type { BracketApiResponse, NFLPlayoffGame, NFLPlayoffGroup } from "../types/football/football";

const game = (id: number, week: number, headline?: string) =>
  ({ id, week: { number: week }, headline } as NFLPlayoffGame);
const bracket = (games: NFLPlayoffGame[], groups: NFLPlayoffGroup[] = []) =>
  ({ games, groups } as BracketApiResponse);

test("selects a Super Bowl in week 4 ahead of a Pro Bowl in week 5", () => {
  const final = game(1, 4, "Super Bowl LX");
  assert.equal(selectNFLSuperBowl(bracket([game(2, 5, "Pro Bowl"), final])), final);
});
test("uses a Super Bowl group label when the game has no week or headline", () => {
  const final = { id: 1 } as NFLPlayoffGame;
  const group = { label: "Super Bowl", games: [final] } as NFLPlayoffGroup;
  assert.equal(selectNFLSuperBowl(bracket([], [group])), final);
});
test("supports unlabeled finals in postseason weeks 4 and 5", () => {
  for (const week of [4, 5]) {
    const final = game(1, week);
    assert.equal(selectNFLSuperBowl(bracket([final])), final);
  }
});
test("does not substitute a Pro Bowl or conference championship for the final", () => {
  assert.equal(selectNFLSuperBowl(bracket([game(1, 4, "Pro Bowl"), game(2, 3, "AFC Championship") ])), null);
  assert.equal(selectNFLSuperBowl(null), null);
});
