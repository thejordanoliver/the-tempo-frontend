import assert from "node:assert/strict";
import test from "node:test";
import type { PlayoffMatchup, PlayoffTeam } from "../types/playoffs";
import {
  getBracketMatchupFooter,
  getBracketTeamAccessibilityLabel,
  getBracketTeamLabel,
  getBracketTeamScore,
  isBracketWinner,
} from "../utils/playoffs/bracketPresentation";

const team: PlayoffTeam = {
  id: 3,
  alt_id: "0810",
  name: "Bears",
  fullName: "Chicago Bears",
  shortName: "Bears",
  code: "CHI",
  logo: null,
  logoDark: null,
  seed: 2,
  wins: 1,
  isWinner: true,
};
const matchup: PlayoffMatchup = {
  id: "game",
  name: "Wild Card",
  league: "NFC",
  bestOf: 1,
  status: "complete",
  winnerId: 3,
  winnerAltId: "0810",
  nextSeriesId: null,
  teams: [team, null],
  games: [
    {
      id: "game",
      number: 1,
      date: null,
      status: "FINAL",
      home: { teamAltId: "0810", score: 0 },
      away: { teamAltId: "1800", score: 7 },
    },
  ],
};

test("single-game cards show points, including zero, rather than series wins", () => {
  assert.equal(getBracketTeamScore(team, matchup), 0);
  assert.equal(getBracketTeamScore({ ...team, alt_id: "1800" }, matchup), 7);
});
test("series cards show wins and bye cards omit the score", () => {
  assert.equal(getBracketTeamScore(team, { ...matchup, bestOf: 7 }), 1);
  assert.equal(getBracketTeamScore(team), null);
});
test("missing participants and unknown game scores display a dash", () => {
  assert.equal(getBracketTeamScore(null, matchup), "–");
  assert.equal(getBracketTeamScore(team, { ...matchup, games: [] }), "–");
  assert.equal(getBracketTeamScore({ ...team, alt_id: null }, matchup), "–");
});
test("team codes remain visible and winner highlighting waits for completion", () => {
  assert.equal(getBracketTeamLabel(team), "CHI");
  assert.equal(getBracketTeamLabel(null), "TBD");
  assert.equal(isBracketWinner(team, matchup), true);
  assert.equal(
    isBracketWinner(team, { ...matchup, status: "in_progress" }),
    false,
  );
  assert.equal(isBracketWinner(team), false);
});
test("screen reader labels include names, seed, score units and winner", () => {
  assert.equal(
    getBracketTeamAccessibilityLabel(team, matchup),
    "Chicago Bears, seed 2, 0 points, winner",
  );
  assert.equal(
    getBracketTeamAccessibilityLabel(team, { ...matchup, bestOf: 7 }),
    "Chicago Bears, seed 2, 1 series wins, winner",
  );
});
test("footers describe the format and status without adding series labels to NFL games", () => {
  assert.equal(getBracketMatchupFooter(matchup), "NFC · Final");
  assert.equal(
    getBracketMatchupFooter({
      ...matchup,
      bestOf: 7,
      league: null,
      status: "in_progress",
    }),
    "Best of 7 · In progress",
  );
  assert.equal(
    getBracketMatchupFooter({ ...matchup, status: "scheduled" }),
    "NFC · Upcoming",
  );
  assert.equal(getBracketMatchupFooter(), "First-round bye");
});
