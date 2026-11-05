import assert from "node:assert/strict";
import test from "node:test";
import { flush, sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

test("champion teams reads the explicit topChampions list and camelCase counts", async () => {
  const h = sportsHookHarness();
  const ranked = [1, 2, 3, 4].map((id) => ({
    team: { id, name: `Team ${id}`, shortName: `T${id}` },
    totalChampionships: 5 - id,
  }));
  h.modules["utils/apiClient"] = {
    apiClient: {
      get: async () => ({
        data: { champions: ranked, topChampions: [ranked[0]] },
      }),
    },
  };
  const { useChampionTeams } = h.load("hooks/LeagueHooks/useChampionTeams.ts");
  h.start(useChampionTeams, [{ league: "nba" }]);
  try {
    await flush();
    assert.equal(h.state.data.length, 1);
    assert.equal(h.state.data[0].totalChampionships, 4);
    assert.equal(h.state.data[0].team.shortName, "T1");
    assert.equal(h.state.champions.length, 4);
  } finally {
    h.stop();
  }
});

test("champion seasons retains camelCase names and logos from the API", async () => {
  const h = sportsHookHarness();
  const champion = {
    id: 122,
    season: 2026,
    team: {
      id: 8,
      name: "Milwaukee Brewers",
      shortName: "Brewers",
      logo: "light.png",
      logoDark: "dark.png",
    },
  };
  h.modules["utils/apiClient"] = {
    apiClient: { get: async () => ({ data: [champion] }) },
  };
  const { useChampions } = h.load("hooks/LeagueHooks/useChampions.ts");
  h.start(useChampions, [{ league: "mlb" }]);
  try {
    await flush();
    assert.equal(h.state.data[0].team.name, "Milwaukee Brewers");
    assert.equal("teamName" in h.state.data[0], false);
    assert.equal(h.state.data[0].team.shortName, "Brewers");
    assert.equal(h.state.data[0].team.logoDark, "dark.png");
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});
