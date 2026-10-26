import assert from "node:assert/strict";
import test from "node:test";
import { flush, sportsHookHarness } from "./helpers/sportsHookHarness.mjs";

function setup(playByPlay) {
  const h = sportsHookHarness();
  const requests = [];
  h.modules["utils/apiClient"] = {
    apiClient: {
      async get(path, options) {
        requests.push({ path, options });
        return {
          data: { score: { status: { state: "in" }, playByPlay }, details: {} },
        };
      },
    },
  };
  const { useSoccerGameDetails } = h.load(
    "hooks/SoccerHooks/useSoccerGameDetails.ts",
  );
  h.start(useSoccerGameDetails, ["epl", "match-1"]);
  return { h, requests };
}

test("keeps backend player data in initial and realtime soccer play-by-play", async () => {
  const event = {
    id: "goal",
    text: "Goal!",
    participants: [
      {
        athlete: {
          id: "1",
          displayName: "Database Player",
          headshot: { href: "database.png" },
        },
      },
    ],
  };
  const { h, requests } = setup([event]);
  try {
    await flush();
    assert.equal(requests[0].path, "api/soccer/details");
    assert.deepEqual(JSON.parse(JSON.stringify(h.state.score.playByPlay)), [
      event,
    ]);
    assert.equal(h.subscription.payload.sport, "soccer");
    const next = { ...event, id: "next", text: "Substitution" };
    h.subscription.onUpdate({
      score: { status: { state: "in" }, playByPlay: [next, event] },
      details: {},
    });
    await flush();
    assert.deepEqual(
      h.state.score.playByPlay.map((play) => play.id),
      ["next", "goal"],
    );
    assert.equal(
      h.state.score.playByPlay[0].participants[0].athlete.headshot.href,
      "database.png",
    );
  } finally {
    h.stop();
  }
});

test("handles missing play-by-play coverage on fetch and realtime updates", async () => {
  const { h } = setup(undefined);
  try {
    await flush();
    assert.equal(h.state.score.playByPlay.length, 0);
    h.subscription.onUpdate({
      score: { status: { state: "in" }, playByPlay: null },
      details: {},
    });
    await flush();
    assert.equal(h.state.score.playByPlay.length, 0);
  } finally {
    h.stop();
  }
});
