import assert from "node:assert/strict";
import test from "node:test";
import { boundedChatMessages, chatMessageKey, chatCacheKey, reconcileChatSnapshot, selectUnconfirmedChatMessages } from "../utils/gameChatState";
import type { ChatMessageItem } from "../types/chat";
const message = (id: string, time = 1): ChatMessageItem => ({ id, user: "alex", senderId: 1, message: "hello", gameId: "game-1", time, delivery: "sent" });

test("cache keys isolate accounts on the same device", () => {
  assert.notEqual(chatCacheKey(1, "game-1"), chatCacheKey(2, "game-1"));
});
test("authoritative snapshots remove blocked or deleted cached messages", () => {
  assert.deepEqual(reconcileChatSnapshot([message("visible")], [message("blocked"), message("deleted")], 100), [message("visible")]);
});
test("snapshot reconciliation preserves arrivals during a request and unsent messages", () => {
  const pending = { ...message("pending"), clientId: "pending", delivery: "pending" as const };
  const arrival = { ...message("arrival", 2), receivedAt: 105 };
  assert.deepEqual(reconcileChatSnapshot([], [pending, arrival], 100), [pending, arrival]);
});
test("server acknowledgements reconcile optimistic messages once", () => {
  const optimistic = { ...message("client"), clientId: "client", delivery: "pending" as const };
  const server = { ...message("server"), clientId: "client" };
  assert.deepEqual(reconcileChatSnapshot([server], [optimistic], 100), [server]);
});
test("chat memory is bounded to the most recent 300 unique messages", () => {
  const messages = Array.from({ length: 500 }, (_, index) => message(String(index), index));
  const result = boundedChatMessages([...messages, message("499", 499)]);
  assert.equal(result.length, 300);
  assert.equal(result[0].id, "200");
});

test("older snapshots cannot overwrite newer reaction events", () => {
  const recent = { ...message("same"), reactions: { "🔥": ["1"] }, reactionVersion: 2 };
  const snapshot = { ...message("same"), reactions: {}, reactionVersion: 1 };
  const [result] = reconcileChatSnapshot([snapshot], [recent], 100);
  assert.deepEqual(result.reactions, recent.reactions);
  assert.equal(result.reactionVersion, 2);
});

test("only the current account's own unconfirmed sends enter the draft cache", () => {
  const own = { ...message("own"), clientId: "own", delivery: "failed" as const };
  const otherAccount = { ...own, id: "other", senderId: 2 };
  const otherGame = { ...own, id: "other-game", gameId: "game-2" };
  assert.deepEqual(selectUnconfirmedChatMessages([own, otherAccount, otherGame, message("confirmed")], 1, "game-1"), [own]);
});

test("another sender reusing a retry ID cannot suppress a local unconfirmed message", () => {
  const pending = { ...message("client"), clientId: "same-retry", delivery: "pending" as const };
  const otherSender = { ...message("other-sender"), senderId: 2, clientId: "same-retry" };
  const result = reconcileChatSnapshot([otherSender], [pending], 100);
  assert.equal(result.length, 2);
  assert.ok(result.some((row) => row.id === pending.id));
});

test("list keys remain stable on acknowledgement and distinguish sender-scoped retry IDs", () => {
  const pending = { ...message("client"), clientId: "retry" };
  const acknowledged = { ...pending, id: "server" };
  const otherSender = { ...acknowledged, senderId: 2 };
  assert.equal(chatMessageKey(pending), chatMessageKey(acknowledged));
  assert.notEqual(chatMessageKey(acknowledged), chatMessageKey(otherSender));
});
test("messages from deleted accounts retain distinct list keys", () => {
  const first = { ...message("first"), senderId: null, clientId: "retry" };
  const second = { ...first, id: "second" };
  assert.notEqual(chatMessageKey(first), chatMessageKey(second));
});
