import assert from "node:assert/strict";
import test from "node:test";
import type { FavoriteSportId } from "../constants/leagues";

// @ts-ignore Node's type-stripping test runner requires the .ts extension.
import { getFavoriteHeaderAccessibilityLabel, getFavoriteHeaderIconName } from "../components/CustomHeader/favoriteAction.ts";
// @ts-ignore Node's type-stripping test runner requires the .ts extension.
import { executeFavoriteSportToggle, restoreFavoriteSportMembership } from "../utils/favoriteSports.ts";

test("favorite-sport header renders outline and filled heart states", () => {
  assert.equal(getFavoriteHeaderIconName(false), "heart-outline");
  assert.equal(getFavoriteHeaderIconName(true), "heart");
  assert.equal(
    getFavoriteHeaderAccessibilityLabel(false),
    "Add to favorites",
  );
  assert.equal(
    getFavoriteHeaderAccessibilityLabel(true),
    "Remove from favorites",
  );
});

test("pressing the header action adds the canonical league without reordering existing sports", async () => {
  const requestLock = { current: false };
  const savedRequests: FavoriteSportId[][] = [];
  let renderedSports: FavoriteSportId[] = ["nfl", "mlb"];

  const saved = await executeFavoriteSportToggle({
    league: "nba",
    favoriteSports: renderedSports,
    requestLock,
    save: async (favoriteSports) => {
      savedRequests.push(favoriteSports);
      return favoriteSports;
    },
    onOptimisticUpdate: (favoriteSports) => {
      renderedSports = favoriteSports;
    },
    onAccepted: (favoriteSports) => {
      renderedSports = favoriteSports;
    },
    onRejected: () => undefined,
  });

  assert.equal(saved, true);
  assert.deepEqual(savedRequests, [["nfl", "mlb", "nba"]]);
  assert.deepEqual(renderedSports, ["nfl", "mlb", "nba"]);
});

test("pressing a filled header action removes only that league", async () => {
  const requestLock = { current: false };
  let renderedSports: FavoriteSportId[] = ["nfl", "nba", "mlb"];

  await executeFavoriteSportToggle({
    league: "nba",
    favoriteSports: renderedSports,
    requestLock,
    save: async (favoriteSports) => favoriteSports,
    onOptimisticUpdate: (favoriteSports) => {
      renderedSports = favoriteSports;
    },
    onAccepted: (favoriteSports) => {
      renderedSports = favoriteSports;
    },
    onRejected: () => undefined,
  });

  assert.deepEqual(renderedSports, ["nfl", "mlb"]);
});

test("a rejected request restores only the toggled league and leaves teams unchanged", async () => {
  const requestLock = { current: false };
  const favoriteTeams = ["nba:17", "nfl:2"];
  let renderedSports: FavoriteSportId[] = ["nfl", "nba", "mlb"];

  const saved = await executeFavoriteSportToggle({
    league: "nba",
    favoriteSports: renderedSports,
    requestLock,
    save: async () => {
      throw new Error("request failed");
    },
    onOptimisticUpdate: (favoriteSports) => {
      renderedSports = favoriteSports;
    },
    onAccepted: () => undefined,
    onRejected: (_error, previousFavoriteSports) => {
      renderedSports = restoreFavoriteSportMembership(
        [...renderedSports, "wnba"],
        previousFavoriteSports,
        "nba",
      );
    },
  });

  assert.equal(saved, false);
  assert.deepEqual(renderedSports, ["nfl", "nba", "mlb", "wnba"]);
  assert.deepEqual(favoriteTeams, ["nba:17", "nfl:2"]);
});

test("rapid repeated presses cannot start overlapping sport requests", async () => {
  const requestLock = { current: false };
  let resolveRequest!: (favorites: FavoriteSportId[]) => void;
  let requestCount = 0;

  const save = (favoriteSports: FavoriteSportId[]) => {
    requestCount += 1;
    return new Promise<FavoriteSportId[]>((resolve) => {
      resolveRequest = resolve;
    });
  };

  const options = {
    league: "nba" as const,
    favoriteSports: ["nfl" as const],
    requestLock,
    save,
    onOptimisticUpdate: () => undefined,
    onAccepted: () => undefined,
    onRejected: () => undefined,
  };

  const firstPress = executeFavoriteSportToggle(options);
  const secondPress = executeFavoriteSportToggle(options);

  assert.equal(await secondPress, false);
  assert.equal(requestCount, 1);

  resolveRequest(["nfl", "nba"]);
  assert.equal(await firstPress, true);
  assert.equal(requestLock.current, false);
});
