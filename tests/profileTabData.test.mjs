import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function predictionHarness(profile = true) {
  let focused = true;
  let now = 1000;
  const h = sportsHookHarness({ globals: { Date: { now: () => now } } });
  const requests = [];
  const updates = h.load("services/predictionUpdates.ts");
  h.modules["services/predictionUpdates"] = updates;
  h.modules["services/fanPredictionsApi"] = {
    fetchUserPredictionPicks(userId, offset, signal, sort) {
      const request = { userId, offset, signal, sort, ...deferred() };
      requests.push(request);
      return request.promise;
    },
  };
  h.modules["expo-router"] = {
    useFocusEffect(callback) {
      h.react.useEffect(
        () => (focused ? callback() : undefined),
        [callback, focused],
      );
    },
  };
  const name = profile ? "useProfilePredictions" : "useUserPredictionPicks";
  h.start(h.load(`hooks/${name}.ts`)[name], [7]);
  return Object.assign(h, {
    requests,
    updates,
    focus(value) {
      focused = value;
      h.update();
    },
    advance(ms) {
      now += ms;
    },
  });
}

const response = (id = "first", nextOffset = null) => ({
  record: { userId: 7, rank: 1 },
  picks: [{ gameId: id }],
  nextOffset,
});

test("profile predictions reuse loaded data across repeated tab visits, including empty results", async () => {
  for (const data of [
    response(),
    { record: null, picks: [], nextOffset: null },
  ]) {
    const h = predictionHarness();
    try {
      h.requests[0].resolve(data);
      await flush();
      for (let i = 0; i < 3; i++) {
        h.focus(false);
        h.focus(true);
        await flush();
      }
      assert.equal(h.requests.length, 1);
      assert.equal(h.state.loading, false);
      assert.equal(h.state.record, data.record);
      assert.equal(h.state.picks.length, data.picks.length);
    } finally {
      h.stop();
    }
  }
});

test("stale prediction data refreshes without skeletons or losing loaded content on failure", async () => {
  const h = predictionHarness();
  try {
    h.requests[0].resolve(response());
    await flush();
    h.focus(false);
    h.advance(60_001);
    h.focus(true);
    await flush();
    assert.equal(h.requests.length, 2);
    assert.equal(h.state.loading, false);
    assert.equal(h.state.picks[0].gameId, "first");
    h.requests[1].reject(new Error("offline"));
    await flush();
    assert.equal(h.state.picks[0].gameId, "first");
    assert.equal(h.state.error, null);
    h.state.refresh();
    await flush();
    h.requests[2].resolve(response("updated"));
    await flush();
    assert.equal(h.state.picks[0].gameId, "updated");
  } finally {
    h.stop();
  }
});

test("prediction changes invalidate hidden data and unrelated fans do not refetch it", async () => {
  const h = predictionHarness();
  try {
    h.requests[0].resolve(response());
    await flush();
    h.updates.notifyPredictionPicksChanged(8);
    await flush();
    assert.equal(h.requests.length, 1);
    h.focus(false);
    h.updates.notifyPredictionPicksChanged(7);
    await flush();
    assert.equal(h.requests.length, 1);
    h.focus(true);
    await flush();
    assert.equal(h.requests.length, 2);
    h.requests[1].resolve(response("new pick"));
    await flush();
    h.updates.notifyPredictionPicksChanged();
    await flush();
    assert.equal(h.requests.length, 3);
  } finally {
    h.stop();
  }
});

test("prediction history preserves pagination on return and rejects a previous fan's late response", async () => {
  const h = predictionHarness(false);
  try {
    h.requests[0].resolve(response("first", 25));
    await flush();
    h.state.loadMore();
    await flush();
    assert.equal(h.requests[1].offset, 25);
    h.requests[1].resolve(response("second"));
    await flush();
    h.focus(false);
    h.focus(true);
    await flush();
    assert.equal(h.requests.length, 2);
    assert.equal(h.state.data.picks.length, 2);
    h.state.refresh();
    await flush();
    h.update([8]);
    await flush();
    assert.equal(h.requests[2].signal.aborted, true);
    assert.equal(h.state.data, null);
    h.requests[2].resolve(response("wrong fan"));
    await flush();
    assert.equal(h.state.data, null);
    h.requests[3].resolve(response("fan 8"));
    await flush();
    assert.equal(h.state.data.picks[0].gameId, "fan 8");
    h.update([8, "oldest"]);
    await flush();
    assert.equal(h.state.data.picks.length, 0);
    assert.equal(h.requests[4].sort, "oldest");
  } finally {
    h.stop();
  }
});

function postsHarness(bookmarks = true) {
  const h = sportsHookHarness();
  const requests = [];
  const updates = h.load("services/forumBookmarkUpdates.ts");
  h.modules["services/forumBookmarkUpdates"] = updates;
  h.modules["axios"] = { isAxiosError: () => false };
  h.modules["services/forumApi"] = { loadPostPolls: async (posts) => posts };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const request = { url, config, ...deferred() };
        requests.push(request);
        return request.promise;
      },
    },
  };
  const file = bookmarks
    ? "ForumHooks/useBookmarkedPosts"
    : "UserHooks/useUserPosts";
  const name = bookmarks ? "useBookmarkedPosts" : "useUserPosts";
  h.start(h.load(`hooks/${file}.ts`)[name], [{ userId: 7, enabled: true }]);
  return Object.assign(h, { requests, updates });
}
const postsResponse = (id, totalPages = 1) => ({
  data: { posts: [{ id }], pagination: { totalPages } },
});

test("bookmarks and posts keep their loaded pages when their tab is deselected", async () => {
  for (const bookmarks of [true, false]) {
    const h = postsHarness(bookmarks);
    try {
      await flush();
      h.requests[0].resolve(postsResponse("first", 2));
      await flush();
      h.state.loadMore();
      await flush();
      h.requests[1].resolve(postsResponse("second", 2));
      await flush();
      h.update([{ userId: 7, enabled: false }]);
      await flush();
      assert.equal(h.state.posts.length, 2);
      h.update([{ userId: 7, enabled: true }]);
      await flush();
      assert.equal(h.requests.length, 2);
      assert.equal(h.state.posts.length, 2);
      h.state.refresh();
      await flush();
      assert.equal(h.requests.length, 3);
    } finally {
      h.stop();
    }
  }
});

test("bookmarks refresh after mutations, preserve data on failure, and clear for another account", async () => {
  const h = postsHarness();
  try {
    await flush();
    h.requests[0].resolve(postsResponse("saved"));
    await flush();
    h.update([{ userId: 7, enabled: false }]);
    await flush();
    h.updates.notifyForumBookmarksChanged();
    await flush();
    assert.equal(h.requests.length, 1);
    h.update([{ userId: 7, enabled: true }]);
    await flush();
    assert.equal(h.state.loading, false);
    assert.equal(h.state.refreshing, true);
    h.requests[1].reject(new Error("offline"));
    await flush();
    assert.equal(h.state.posts[0].id, "saved");
    h.state.refresh();
    await flush();
    h.update([{ userId: 8, enabled: true }]);
    assert.equal(h.state.posts.length, 0);
    await flush();
    assert.equal(h.requests[2].config.signal.aborted, true);
    h.requests[2].resolve(postsResponse("wrong account"));
    await flush();
    assert.equal(h.state.posts.length, 0);
    h.requests[3].resolve(postsResponse("account 8"));
    await flush();
    assert.equal(h.state.posts[0].id, "account 8");
  } finally {
    h.stop();
  }
});

test("a bookmark mutation during a request cannot leave the cached list stale", async () => {
  const h = postsHarness();
  try {
    await flush();
    h.updates.notifyForumBookmarksChanged();
    await flush();
    h.requests[0].resolve(postsResponse("old"));
    await flush();
    assert.equal(h.requests.length, 2);
    h.requests[1].resolve(postsResponse("new"));
    await flush();
    assert.equal(h.state.posts[0].id, "new");
  } finally {
    h.stop();
  }
});

test("returning after an interrupted prediction refresh does not leave a refresh spinner running", async () => {
  const h = predictionHarness(false);
  try {
    h.requests[0].resolve(response());
    await flush();
    h.state.refresh();
    await flush();
    assert.equal(h.state.loading, true);
    h.focus(false);
    h.focus(true);
    await flush();
    assert.equal(h.requests[1].signal.aborted, true);
    assert.equal(h.requests.length, 2);
    assert.equal(h.state.loading, false);
    assert.equal(h.state.data.picks[0].gameId, "first");
  } finally {
    h.stop();
  }
});
