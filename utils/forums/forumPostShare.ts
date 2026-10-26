// Matches the registered Expo scheme in app.json. These links require Tempo.
const POST_LINK_PREFIX = "tempo://post/";
const LEGACY_POST_LINK_PREFIX = "nbascorestracker://post/";

export function getForumPostPreviewText(text: string): string {
  const trimmed = text.trim();
  const preview = trimmed.slice(0, 280).split("\n").slice(0, 4).join("\n");
  return preview.length < trimmed.length ? `${preview.trimEnd()}…` : preview;
}

export function getSharedForumPostFallback(text: string) {
  const body = text.trim().split("\n").slice(0, -1).join("\n").trim();
  const header = body.match(/^Post from @([^\n]+) on Tempo(?:\n|$)/);
  return {
    username: header?.[1] ?? "",
    text: getForumPostPreviewText(header ? body.slice(header[0].length) : body),
  };
}

export function getForumPostShareLink(postId: string): string {
  return `${POST_LINK_PREFIX}${encodeURIComponent(postId)}`;
}

export function getForumPostShareText(post: {
  id: string;
  username: string;
  text: string;
}): string {
  const preview = getForumPostPreviewText(post.text);
  return [
    `Post from @${post.username} on Tempo`,
    preview,
    getForumPostShareLink(post.id),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function getSharedForumPostId(text: string): string | null {
  const lastLine = text.trim().split("\n").at(-1)?.trim() ?? "";
  const prefix = [POST_LINK_PREFIX, LEGACY_POST_LINK_PREFIX].find((value) =>
    lastLine.startsWith(value),
  );
  if (!prefix) return null;
  const encodedId = lastLine.slice(prefix.length);
  if (!encodedId || /[/?#\s]/.test(encodedId)) return null;
  try {
    const id = decodeURIComponent(encodedId);
    return id && !/[/?#\s]/.test(id) ? id : null;
  } catch {
    return null;
  }
}
