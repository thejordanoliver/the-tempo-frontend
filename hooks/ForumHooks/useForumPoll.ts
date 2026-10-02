import { useCallback, useEffect, useRef, useState } from "react";
import { getPostPoll, voteOnPostPoll } from "services/forumApi";
import type { ForumPollState } from "types/forum";

export function useForumPoll(postId: string) {
  const [state, setState] = useState<{
    postId: string;
    poll: ForumPollState | null;
    loading: boolean;
    voting: boolean;
  }>({ postId, poll: null, loading: true, voting: false });
  const version = useRef(0);
  const votePending = useRef(false);

  useEffect(() => {
    const requestVersion = ++version.current;
    const controller = new AbortController();
    votePending.current = false;
    const isCurrent = () => version.current === requestVersion;

    void getPostPoll(postId, controller.signal)
      .then((poll) => {
        if (isCurrent()) setState({ postId, poll, loading: false, voting: false });
      })
      .catch(() => {
        // Posts without a poll return 404.
        if (isCurrent()) setState({ postId, poll: null, loading: false, voting: false });
      });

    return () => {
      version.current += 1;
      controller.abort();
    };
  }, [postId]);

  const poll = state.postId === postId ? state.poll : null;
  const loading = state.postId !== postId || state.loading;
  const voting = state.postId === postId && state.voting;
  const hasVoted = poll?.options.some((option) => option.voted_by_current_user) ?? false;
  const totalVotes = poll?.options.reduce((sum, option) => sum + option.vote_count, 0) ?? 0;
  const isExpired = poll?.expires_at != null && new Date(poll.expires_at) < new Date();

  const handleVote = useCallback(async (optionId: number) => {
    if (!poll || votePending.current || hasVoted || isExpired ||
        !poll.options.some((option) => option.id === optionId)) return;

    const requestVersion = version.current;
    const isCurrent = () => version.current === requestVersion;
    votePending.current = true;
    setState({
      postId, loading: false, voting: true,
      poll: {
        ...poll,
        options: poll.options.map((option) => option.id === optionId
          ? { ...option, vote_count: option.vote_count + 1, voted_by_current_user: true }
          : option),
      },
    });

    try {
      await voteOnPostPoll(postId, optionId);
    } catch (error) {
      if (isCurrent()) {
        setState({ postId, poll, loading: false, voting: false });
        votePending.current = false;
      }
      console.error("Vote failed:", error);
      return;
    }

    if (!isCurrent()) return;

    // A refresh failure must not undo a vote already accepted by the backend.
    try {
      const freshPoll = await getPostPoll(postId);
      if (isCurrent()) setState({ postId, poll: freshPoll, loading: false, voting: false });
    } catch {
      // Keep the accepted optimistic vote until the next fetch.
    } finally {
      if (isCurrent()) {
        votePending.current = false;
        setState((current) => ({ ...current, voting: false }));
      }
    }
  }, [hasVoted, isExpired, poll, postId]);

  return { poll, loading, voting, hasVoted, totalVotes, isExpired, handleVote };
}
