import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const defer = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setImmediate(resolve));

// Execute the actual hooks with injected platform dependencies and explicit
// render/effect lifecycles so async races can be tested without a native device.
function hookHarness(file, exportName, dependencies) {
  let cursor = 0, effects = [];
  const slots = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (next) => {
        slots[index] = typeof next === "function" ? next(slots[index]) : next;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback(callback) { return callback; },
    useEffect(callback, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: callback() };
        });
      }
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, {
    exports, require: (name) => name === "react" ? react : dependencies[name],
    AbortController, console: { error() {}, warn() {} }, __DEV__: false,
  });
  return {
    render(...args) {
      cursor = 0;
      const result = exports[exportName](...args);
      const pending = effects; effects = [];
      pending.forEach((effect) => effect());
      return result;
    },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

const poll = {
  question: "Winner?", expires_at: null,
  options: [{ id: 1, text: "Home", vote_count: 3, voted_by_current_user: false }],
};

test("a successful poll vote survives a failed reconciliation fetch", async () => {
  let fetches = 0, votes = 0;
  const vote = defer();
  const hook = hookHarness("hooks/ForumHooks/useForumPoll.ts", "useForumPoll", {
    "services/forumApi": {
      getPostPoll: async () => { if (++fetches > 1) throw new Error("offline"); return poll; },
      voteOnPostPoll: () => { votes++; return vote.promise; },
    },
  });
  hook.render("post-1");
  await flush();
  const ready = hook.render("post-1");
  const first = ready.handleVote(1);
  await ready.handleVote(1);
  assert.equal(votes, 1);
  vote.resolve();
  await first;
  const accepted = hook.render("post-1");
  assert.equal(accepted.hasVoted, true);
  assert.equal(accepted.totalVotes, 4);
  assert.equal(accepted.voting, false);
});

test("a rejected poll vote rolls back the optimistic selection and count", async () => {
  const hook = hookHarness("hooks/ForumHooks/useForumPoll.ts", "useForumPoll", {
    "services/forumApi": {
      getPostPoll: async () => poll,
      voteOnPostPoll: async () => { throw new Error("rejected"); },
    },
  });
  hook.render("post-1"); await flush();
  await hook.render("post-1").handleVote(1);
  const result = hook.render("post-1");
  assert.equal(result.hasVoted, false);
  assert.equal(result.totalVotes, 3);
  assert.equal(result.voting, false);
});

test("an older poll fetch cannot populate another post", async () => {
  const old = defer();
  const hook = hookHarness("hooks/ForumHooks/useForumPoll.ts", "useForumPoll", {
    "services/forumApi": {
      getPostPoll: (id) => id === "old" ? old.promise : Promise.resolve({ ...poll, question: "New" }),
    },
  });
  hook.render("old");
  hook.render("new"); await flush();
  old.resolve(poll); await flush();
  assert.equal(hook.render("new").poll.question, "New");
});

test("post bookmarks suppress duplicate submissions and preserve server reconciliation", async () => {
  const request = defer();
  let calls = 0, changed;
  const store = { likes: {}, setLike(id, liked, count) { store.likes[id] = { liked, count }; } };
  const useStore = (selector) => selector ? selector(store) : store;
  const hook = hookHarness("hooks/ForumHooks/useForumPostInteractions.ts", "useForumPostInteractions", {
    axios: { isAxiosError: () => false },
    "hooks/ForumHooks/useBadgeNotifications": { useBadgeNotifications: () => ({ handleBadgeAwards() {} }) },
    "store/useLikesStore": { useLikesStore: useStore },
    "services/forumApi": { setPostBookmark: () => { calls++; return request.promise; } },
  });
  const options = { item: { id: "post-1", liked_by_current_user: false, likes: 3,
    bookmarks: 0, shares: 0, user_id: 7 }, currentUserId: 8,
    onBookmarkChange: (post) => { changed = post; } };
  const ready = hook.render(options);
  const first = ready.handleBookmarkPress();
  await ready.handleBookmarkPress();
  assert.equal(calls, 1);
  request.resolve({ post: { bookmarked_by_current_user: true, bookmarks: 5 } });
  await first;
  const result = hook.render(options);
  assert.equal(result.bookmarkCount, 5);
  assert.equal(result.bookmarked, true);
  assert.equal(result.bookmarkPending, false);
  assert.equal(changed.bookmarks, 5);
  const refreshed = hook.render({
    ...options, item: { ...options.item, bookmarks: 2, shares: 9, bookmarked_by_current_user: false },
  });
  assert.equal(refreshed.bookmarkCount, 2);
  assert.equal(refreshed.bookmarked, false);
  assert.equal(refreshed.shareCount, 9);
  // Returning to the old prop values must not resurrect an obsolete override.
  assert.equal(hook.render(options).bookmarkCount, 0);
});

test("an older like response cannot overwrite a newer unlike", async () => {
  const first = defer(), second = defer();
  let calls = 0;
  const store = { likes: {}, setLike(id, liked, count) { store.likes[id] = { liked, count }; } };
  const hook = hookHarness("hooks/ForumHooks/useForumPostInteractions.ts", "useForumPostInteractions", {
    axios: { isAxiosError: () => false },
    "hooks/ForumHooks/useBadgeNotifications": { useBadgeNotifications: () => ({ handleBadgeAwards() {} }) },
    "store/useLikesStore": { useLikesStore: (selector) => selector ? selector(store) : store },
    "services/forumApi": { setPostLike: () => (++calls === 1 ? first.promise : second.promise) },
  });
  const options = { item: { id: "post-1", liked_by_current_user: false, likes: 3,
    shares: 0, user_id: 7 }, currentUserId: 8 };
  const like = hook.render(options).toggleLikePress();
  const unlike = hook.render(options).toggleLikePress();
  second.resolve({ post: { liked_by_current_user: false, likes: 3 } }); await unlike;
  first.resolve({ post: { liked_by_current_user: true, likes: 4 } }); await like;
  assert.equal(hook.render(options).liked, false);
  assert.equal(store.likes["post-1"].count, 3);
});

test("a media-like response arriving after unmount cannot update shared likes", async () => {
  const response = defer();
  const store = { likes: {}, setLike(id, liked, count) { store.likes[id] = { liked, count }; } };
  const hook = hookHarness("hooks/ForumHooks/useForumMediaLike.ts", "useForumMediaLike", {
    "hooks/ForumHooks/useBadgeNotifications": { useBadgeNotifications: () => ({ handleBadgeAwards() {} }) },
    "store/useLikesStore": { useLikesStore: (selector) => selector ? selector(store) : store },
    "services/forumApi": { setPostLike: () => response.promise },
  });
  const ready = hook.render({ postId: "post-1", likedByCurrentUser: false, likesCount: 3 });
  const pending = ready.toggleLikePress();
  hook.unmount();
  response.resolve({ post: { liked_by_current_user: true, likes: 99 } }); await pending;
  assert.equal(store.likes["post-1"].count, 4);
});

function shareHarness({ authorId = 7, smsResult = "sent", available = true, send = async () => true, search = async () => [] } = {}) {
  let shares = 0, smsCalls = 0;
  const hook = hookHarness("hooks/ForumHooks/useForumPostShare.ts", "useForumPostShare", {
    "contexts/MessagesContext": { useMessagesContext: () => ({ createOrGetConversation: async () => ({ conversationId: "dm-1" }), sendDirectMessage: send, getConversationList: () => ({ items: [], loaded: true }), loadConversations: async () => {} }) },
    "react-native": { Share: { sharedAction: "sharedAction", share: async () => ({ action: "sharedAction" }) } },
    "expo-sms": { isAvailableAsync: async () => available, sendSMSAsync: async () => { smsCalls++; return { result: smsResult }; } },
    "hooks/useDebounce": { useDebounce: (value) => value },
    "services/usersApi": { searchUsers: search },
    "utils/getErrorMessage": { getErrorMessage: (error, fallback) => error.message || fallback },
    "services/defaultMessagingApp": { getDefaultMessagingApp: async () => null },
    "utils/forumShareRecipients": { getForumShareRecipients: () => [] },
    "utils/forumPostShare": { getForumPostShareText: () => "Post from @fan on Tempo\nnbascorestracker://post/post-1" },
  });
  const render = () => hook.render({ id: "post-1", username: "fan", text: "Preview", user_id: authorId }, 1, async () => { shares++; });
  return { render, send: async (user) => { render().requestSend(user); return render().confirmSend(); }, get shares() { return shares; }, get smsCalls() { return smsCalls; } };
}

test("opening the share sheet and cancelled or unknown SMS results never count a share", async () => {
  for (const smsResult of ["cancelled", "unknown"]) {
    const harness = shareHarness({ smsResult });
    harness.render().open();
    assert.equal(harness.shares, 0);
    assert.equal(await harness.render().sendSms(), smsResult !== "cancelled");
    assert.equal(harness.shares, 0);
  }
  const sent = shareHarness();
  await sent.render().sendSms();
  assert.equal(sent.shares, 1);
});

test("unavailable SMS surfaces feedback and never opens a composer", async () => {
  const harness = shareHarness({ available: false });
  assert.equal(await harness.render().sendSms(), false);
  assert.match(harness.render().error, /unavailable/);
  assert.equal(harness.smsCalls, 0);
  assert.equal(harness.shares, 0);
});

test("failed DMs retain their identifier on retry and only successful sends count", async () => {
  const ids = [];
  const harness = shareHarness({ send: async (_conversation, payload) => {
    ids.push(payload.clientId);
    if (ids.length === 1) throw new Error("DM privacy does not allow this message");
    return true;
  } });
  await harness.send({ id: 2, username: "recipient" });
  assert.match(harness.render().error, /privacy/);
  assert.equal(harness.shares, 0);
  await harness.send({ id: 2, username: "recipient" });
  assert.equal(ids[0], ids[1]);
  assert.equal(harness.shares, 1);
  assert.equal(harness.render().sentTo, "recipient");
});

test("recipient search excludes the current user and ignores stale search responses", async () => {
  const older = defer();
  const harness = shareHarness({ search: async (query) => query === "old" ? older.promise : [{ id: 1, username: "self" }, { id: 2, username: "new" }] });
  harness.render().open();
  harness.render().setQuery("old"); harness.render();
  harness.render().setQuery("new"); harness.render();
  await flush();
  older.resolve([{ id: 3, username: "old" }]);
  await flush();
  assert.deepEqual(Array.from(harness.render().users, (user) => user.username), ["new"]);
});


test("recipient selection waits for confirmation and cancelling sends nothing", async () => {
  let sends = 0;
  const harness = shareHarness({ send: async () => { sends++; return true; } });
  harness.render().requestSend({ id: 2, username: "recipient" });
  assert.equal(harness.render().confirmRecipient.username, "recipient");
  assert.equal(sends, 0);
  harness.render().cancelSend();
  await harness.render().confirmSend();
  assert.equal(sends, 0);
  assert.equal(harness.render().confirmRecipient, null);
  harness.render().requestSend({ id: 2, username: "recipient" });
  const first = harness.render().confirmSend();
  await harness.render().confirmSend();
  await first;
  assert.equal(sends, 1);
  assert.equal(harness.shares, 1);
});

test("sharing own post still sends DMs and opens SMS but never records a share", async () => {
  let sends = 0;
  const harness = shareHarness({ authorId: 1, send: async () => { sends++; return true; } });
  await harness.send({ id: 2, username: "recipient" });
  assert.equal(sends, 1);
  assert.equal(harness.render().sentTo, "recipient");
  await harness.render().sendSms();
  assert.equal(harness.smsCalls, 1);
  assert.equal(harness.shares, 0);
});
