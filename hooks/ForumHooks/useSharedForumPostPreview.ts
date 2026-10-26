import { useEffect, useState } from "react";
import { getForumPost } from "services/forumApi";
import type { ForumPost } from "types/forum";
import {
  getForumPostPreviewText,
  getSharedForumPostFallback,
} from "utils/forums/forumPostShare";

export function useSharedForumPostPreview(postId: string, messageText: string) {
  const [loaded, setLoaded] = useState<{
    postId: string;
    post: ForumPost;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void getForumPost(postId, controller.signal)
      .then((post) => {
        if (!controller.signal.aborted && post) setLoaded({ postId, post });
      })
      // Keep the original message available when offline or the post was removed.
      .catch(() => {});
    return () => controller.abort();
  }, [postId]);

  const post = loaded?.postId === postId ? loaded.post : null;
  const fallback = getSharedForumPostFallback(messageText);
  return {
    username: post?.username ?? fallback.username,
    text: post
      ? getForumPostPreviewText(post.text.replace(/\s+/g, " "))
      : fallback.text.replace(/\s+/g, " "),
    profileImage: post?.profile_image || null,
    image: post?.images?.find((uri) => uri.trim()) ?? null,
  };
}
