import type { MessageItem } from "types/messages";
import type { UserSearchResult } from "services/usersApi";

export function getForumShareRecipients(conversations: MessageItem[], currentUserId: number | null): UserSearchResult[] {
  const activity = (item: MessageItem) => {
    const time = Date.parse(item.activityAt ?? item.lastMessageAt ?? item.updatedAt ?? "");
    return Number.isFinite(time) ? time : 0;
  };
  const seen = new Set<string>();
  return [...conversations].sort((a, b) => activity(b) - activity(a)).flatMap((item) => {
    const id = item.userId;
    if (id == null || !String(id).trim() || String(id) === String(currentUserId) || item.type === "group" || seen.has(String(id))) return [];
    seen.add(String(id));
    return [{ id, username: item.username, fullName: item.fullName || item.full_name, profileImageUrl: item.profileImageUrl, isVerified: item.isVerified }];
  }).slice(0, 20);
}
