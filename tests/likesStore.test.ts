import assert from "node:assert/strict";
import test from "node:test";

import { useLikesStore } from "../store/useLikesStore";

const resetStore = () => {
  useLikesStore.setState({ currentUserId: null, likes: {} });
};

test("like state is cleared when the authenticated user changes", () => {
  resetStore();

  const store = useLikesStore.getState();
  store.setUser("1");
  store.setLike("post-1", true, 4);

  useLikesStore.getState().setUser("2");

  assert.equal(useLikesStore.getState().currentUserId, "2");
  assert.deepEqual(useLikesStore.getState().likes, {});
});

test("like state is cleared on logout", () => {
  resetStore();

  useLikesStore.getState().setUser("1");
  useLikesStore.getState().setLike("post-1", true, 4);
  useLikesStore.getState().setUser(null);

  assert.equal(useLikesStore.getState().currentUserId, null);
  assert.deepEqual(useLikesStore.getState().likes, {});
});

test("same-user token refreshes preserve current like state", () => {
  resetStore();

  useLikesStore.getState().setUser("1");
  useLikesStore.getState().setLike("post-1", true, 4);
  useLikesStore.getState().setUser("1");

  assert.deepEqual(useLikesStore.getState().likes, {
    "post-1": { liked: true, count: 4 },
  });
});
