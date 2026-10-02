import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { useForumPoll } from "hooks/ForumHooks/useForumPoll";
import { Text, TouchableOpacity, View } from "react-native";
import { PostItemStyles } from "styles/ForumStyles/PostItemStyles";

export default function PollBlock({
  postId,
  isDark,
}: {
  postId: string;
  isDark: boolean;
}) {
  const styles = PostItemStyles(isDark);
  const { poll, loading, voting, hasVoted, totalVotes, isExpired, handleVote } =
    useForumPoll(postId);

  if (loading || !poll) return null;

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
                        fontFamily: isSelected ? Fonts.MEDIUM : Fonts.REGULAR,
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
