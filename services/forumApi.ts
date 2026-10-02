import type {
  ForumBookmarkMutationResponse,
  ForumLikeMutationResponse,
  ForumPollResponse,
  ForumPost,
  ForumShareMutationResponse,
} from "types/forum";
import { apiClient } from "utils/apiClient";

const postPath = (postId: string) =>
  `/api/forum/post/${encodeURIComponent(postId)}`;

export async function getPostPoll(postId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ForumPollResponse>(
    `${postPath(postId)}/poll`, { signal },
  );
  return response.data.poll ?? null;
}

export async function voteOnPostPoll(postId: string, optionId: number) {
  await apiClient.post(`${postPath(postId)}/poll/vote`, { optionId });
}

export async function setPostLike(postId: string, like: boolean) {
  const response = await apiClient.patch<ForumLikeMutationResponse<Partial<ForumPost>>>(
    `${postPath(postId)}/like`, { like },
  );
  return response.data;
}

export async function setPostBookmark(postId: string, bookmark: boolean) {
  const response = await apiClient.patch<ForumBookmarkMutationResponse<Partial<ForumPost>>>(
    `${postPath(postId)}/bookmark`, { bookmark },
  );
  return response.data;
}

export async function sharePost(postId: string) {
  const response = await apiClient.post<ForumShareMutationResponse<Partial<ForumPost>>>(
    `${postPath(postId)}/share`,
  );
  return response.data;
}
