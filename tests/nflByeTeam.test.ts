import assert from "node:assert/strict";
import test from "node:test";
import { selectNFLByeTeam } from "../utils/nflPlayoffSelection";
import type { NFLPlayoffGame } from "../types/football/football";

const game = (home: number, away: number) => ({
  home: { id: home, code: home > 0 ? `T${home}` : "TBD" },
  away: { id: away, code: away > 0 ? `T${away}` : "TBD" },
} as NFLPlayoffGame);
const wildCard = [game(2, 7), game(3, 6), game(4, 5)];

test("finds the divisional participant who skipped the wild card round", () => {
  const divisional = [game(3, 4), game(1, 7)];
  assert.equal(selectNFLByeTeam(wildCard, divisional), divisional[1].home);
});

test("keeps the bye team unknown when wild card participants are incomplete", () => {
  assert.equal(selectNFLByeTeam([game(2, 0), ...wildCard.slice(1)], [game(1, 7)]), undefined);
  assert.equal(selectNFLByeTeam(wildCard.slice(1), [game(1, 7)]), undefined);
});

test("ignores placeholders and ambiguous divisional participants", () => {
  assert.equal(selectNFLByeTeam(wildCard, [game(0, 7)]), undefined);
  assert.equal(selectNFLByeTeam(wildCard, [game(1, 8)]), undefined);
});
