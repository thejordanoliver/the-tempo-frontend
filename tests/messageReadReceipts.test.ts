import assert from "node:assert/strict";
import test from "node:test";
import type { DirectMessageItem, MessageItem } from "../types/messages";
import { getMessageReceiptLabels, getParticipantReadPosition } from "../utils/messageReadReceipts";

const outgoing = (id: string, createdAt: string, extra = {}): DirectMessageItem =>
  ({ id, createdAt, isCurrentUser: true, text: "hello", ...extra }) as DirectMessageItem;
const messages = [
  outgoing("first", "2026-10-02T12:00:00Z"),
  outgoing("second", "2026-10-02T12:01:00Z"),
];

test("explicit read cursor takes precedence over a newer read timestamp", () => {
  const labels = getMessageReceiptLabels(messages, {
    readAt: Date.parse("2026-10-02T12:02:00Z"),
    lastReadMessageId: "first",
    hasMessageCursor: true,
  });
  assert.match(labels.first, /^Read /);
  assert.equal(labels.second, undefined);
});

test("a null cursor does not fall back to timestamps", () => {
  assert.deepEqual(getMessageReceiptLabels(messages, {
    readAt: Date.parse("2026-10-02T12:02:00Z"),
    lastReadMessageId: null,
    hasMessageCursor: true,
  }), { second: "Sent" });
});

test("legacy timestamps mark the latest eligible outgoing message read", () => {
  const labels = getMessageReceiptLabels(messages, {
    readAt: Date.parse("2026-10-02T12:00:30Z"),
    hasMessageCursor: false,
  });
  assert.match(labels.first, /^Read /);
  assert.equal(labels.second, undefined);
});

test("pending and unpersisted messages do not receive receipt labels", () => {
  assert.deepEqual(getMessageReceiptLabels([
    ...messages,
    outgoing("pending", "2026-10-02T12:03:00Z", { status: "pending" }),
    outgoing("local", "2026-10-02T12:04:00Z", { clientId: "local" }),
  ], null), { second: "Sent" });
});

test("participant receipts preserve explicit null cursors and invalid timestamps", () => {
  assert.deepEqual(getParticipantReadPosition({
    userId: "other",
    readReceipts: { other: { readAt: "invalid", lastReadMessageId: null } },
  } as unknown as MessageItem), {
    readAt: null,
    lastReadMessageId: null,
    hasMessageCursor: true,
  });
  assert.equal(getParticipantReadPosition(null), null);
});
