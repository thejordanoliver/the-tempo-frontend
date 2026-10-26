import assert from "node:assert/strict";
import test from "node:test";
import { getStandingsTeamLogo } from "../utils/teams/standingsTeamLogo";

test("uses backend logos for the selected theme", () => {
  const team = {
    logo: "https://database.test/light.png",
    logoDark: "https://database.test/dark.png",
  };
  assert.deepEqual(getStandingsTeamLogo(team, false), { uri: team.logo });
  assert.deepEqual(getStandingsTeamLogo(team, true), { uri: team.logoDark });
});

test("falls back to the main backend logo when the dark logo is missing", () => {
  const team = { logo: "https://database.test/light.png", logoDark: null };
  assert.deepEqual(getStandingsTeamLogo(team, true), { uri: team.logo });
});

test("uses a placeholder for missing teams and missing logos", () => {
  const expected = {
    uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781619331/placeholder/team.png",
  };
  assert.deepEqual(getStandingsTeamLogo(null, true), expected);
  assert.deepEqual(
    getStandingsTeamLogo({ logo: "", logoDark: null }, false),
    expected,
  );
});
