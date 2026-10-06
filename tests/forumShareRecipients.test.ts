import assert from "node:assert/strict";
import test from "node:test";
import { getForumShareRecipients } from "../utils/forumShareRecipients";
import type { MessageItem } from "../types/messages";

const conversation = (userId: number | string | undefined, activityAt: string, extra: Partial<MessageItem> = {}): MessageItem => ({
  id: `conversation-${userId}`, userId, username: `fan-${userId}`, activityAt,
  type: "user", lastMessage: "Hello", timestamp: "", unreadCount: 0, isOnline: false, ...extra,
});

test("quick sharing uses recent users without letting old pinned chats outrank them", () => {
  const users = getForumShareRecipients([
    conversation(2, "2026-10-01T00:00:00Z", { isPinned: true }),
    conversation(3, "2026-10-05T00:00:00Z", { fullName: "Recent Fan", profileImageUrl: "avatar.png" }),
  ], 1);
  assert.deepEqual(users.map((user) => user.id), [3, 2]);
  assert.equal(users[0].fullName, "Recent Fan");
  assert.equal(users[0].profileImageUrl, "avatar.png");
});

test("excludes self, groups, missing recipients and duplicate user IDs", () => {
  const users = getForumShareRecipients([
    conversation(1, ""), conversation("1", ""), conversation(2, ""), conversation("2", ""),
    conversation(undefined, ""), conversation(3, "", { type: "group" }),
  ], 1);
  assert.deepEqual(users.map((user) => user.id), [2]);
});

test("caps the rail and handles invalid/missing activity dates", () => {
  const users = getForumShareRecipients(Array.from({ length: 25 }, (_, index) => conversation(index + 2, "invalid")), 1);
  assert.equal(users.length, 20);
  assert.equal(users[0].id, 2);
});
