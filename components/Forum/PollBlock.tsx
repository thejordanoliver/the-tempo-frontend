import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { postItemStyles } from "styles/ForumStyles/PostItemStyles";
import { apiClient } from "utils/apiClient";
export interface PollOption {
  id: number;
  text: string;
  vote_count: number;
  voted_by_current_user: boolean;
}

export interface PollState {
  id: string;
  question: string;
  allows_multiple: boolean;
  expires_at: string | null;
  options: PollOption[];
}

export default function PollBlock({
  postId,
  isDark,
}: {
  postId: string;
  isDark: boolean;
}) {
  const styles = postItemStyles(isDark);
  const [poll, setPoll] = useState<PollState | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // Fetch poll on mount
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get(`/api/forum/post/${postId}/poll`)
      .then((res) => {
        if (!cancelled) setPoll(res.data.poll);
      })
      .catch(() => {
        // No poll for this post — silently ignore 404
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const hasVoted = poll?.options.some((o) => o.voted_by_current_user) ?? false;
  const totalVotes = poll?.options.reduce((s, o) => s + o.vote_count, 0) ?? 0;

  const handleVote = useCallback(
    async (optionId: number) => {
      if (voting) return;
      if (!poll) return;

      const alreadyVoted = poll.options.some((o) => o.voted_by_current_user);
      if (alreadyVoted) return;

      setVoting(true);

      // Optimistic update
      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          options: prev.options.map((o) =>
            o.id === optionId
              ? {
                  ...o,
                  vote_count: o.vote_count + 1,
                  voted_by_current_user: true,
                }
              : o,
          ),
        };
      });

      try {
        await apiClient.post(`/api/forum/post/${postId}/poll/vote`, {
          optionId,
        });

        // Optionally, fetch latest poll from server to sync state
        const res = await apiClient.get(`/api/forum/post/${postId}/poll`);
        setPoll(res.data.poll);
      } catch (err: any) {
        console.error("Vote failed:", err.response?.data ?? err.message);

        // rollback
        setPoll((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            options: prev.options.map((o) =>
              o.id === optionId
                ? {
                    ...o,
                    vote_count: o.vote_count - 1,
                    voted_by_current_user: false,
                  }
                : o,
            ),
          };
        });
      } finally {
        setVoting(false);
      }
    },
    [poll, voting, postId],
  );

  if (loading || !poll) return null;

  const isExpired =
    poll.expires_at != null && new Date(poll.expires_at) < new Date();

  return (
    <View style={styles.pollContainer}>
      {/* Question */}
      <Text style={styles.pollQuestion}>{poll.question}</Text>

      {/* Options */}
      {poll.options.map((opt) => {
        const pct =
          totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
        const isSelected = opt.voted_by_current_user;
        const showResults = hasVoted || isExpired;

        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => handleVote(opt.id)}
            disabled={hasVoted || isExpired || voting}
            activeOpacity={hasVoted || isExpired ? 1 : 0.7}
            style={{ marginBottom: 8 }}
          >
            <View
              style={[
                styles.optionWrapper,
                {
                  borderColor: isSelected
                    ? Colors.light.blue
                    : isDark
                      ? Colors.darkGray
                      : Colors.lightGray,
                },
              ]}
            >
              {/* Progress bar fill */}
              {showResults && pct > 0 && (
                <View
                  style={[
                    styles.optionFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: isSelected
                        ? Colors.dark.blue + "88" // 20% opacity tint for selected
                        : isDark
                          ? Colors.transparentDarkGray
                          : Colors.transparentLightGray,
                    },
                  ]}
                />
              )}

              {/* Option label row */}
              <View style={styles.optionLabelRow}>
                <View style={styles.optionContent}>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={isDark ? Colors.dark.blue : Colors.light.blue}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      {
                        fontFamily: isSelected
                          ? Fonts.OSMEDIUM
                          : Fonts.OSREGULAR,
                      },
                    ]}
                  >
                    {opt.text}
                  </Text>
                </View>

                {showResults && (
                  <Text style={styles.percentageText}>{pct}%</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Footer */}
      <Text style={styles.footerText}>
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        {poll.allows_multiple ? " · Multiple choice" : ""}
        {isExpired ? " · Closed" : ""}
      </Text>
    </View>
  );
}
