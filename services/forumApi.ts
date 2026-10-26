import { isAxiosError } from "axios";
import type {
  ForumBookmarkMutationResponse,
  ForumLikeMutationResponse,
  ForumPollResponse,
  ForumPost,
  ForumPostResponse,
  ForumShareMutationResponse,
} from "types/forum";
import { apiClient } from "utils/apiClient";

const postPath = (postId: string) =>
  `/api/forum/post/${encodeURIComponent(postId)}`;

export async function getForumPost(postId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ForumPostResponse>(postPath(postId), {
    signal,
  });
  return response.data.post ?? null;
}

export async function getPostPoll(postId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ForumPollResponse>(
    `${postPath(postId)}/poll`,
    { signal },
  );
  return response.data.poll ?? null;
}

// Resolve polls before publishing posts to the UI to avoid a second layout jump.
export async function loadPostPolls<T extends ForumPost>(
  posts: T[],
): Promise<T[]> {
  return Promise.all(
    posts.map(async (post) => {
      if (post.poll !== undefined) return post;
      try {
        return { ...post, poll: await getPostPoll(post.id) };
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return { ...post, poll: null };
        }
        // Keep the post available and allow its poll hook to retry transient failures.
        return post;
      }
    }),
  );
}

export async function voteOnPostPoll(postId: string, optionId: number) {
  await apiClient.post(`${postPath(postId)}/poll/vote`, { optionId });
}

export async function setPostLike(postId: string, like: boolean) {
  const response = await apiClient.patch<
    ForumLikeMutationResponse<Partial<ForumPost>>
  >(`${postPath(postId)}/like`, { like });
  return response.data;
}

export async function setPostBookmark(postId: string, bookmark: boolean) {
  const response = await apiClient.patch<
    ForumBookmarkMutationResponse<Partial<ForumPost>>
  >(`${postPath(postId)}/bookmark`, { bookmark });
  return response.data;
}

export async function sharePost(postId: string) {
  const response = await apiClient.post<
    ForumShareMutationResponse<Partial<ForumPost>>
  >(`${postPath(postId)}/share`);
  return response.data;
}
