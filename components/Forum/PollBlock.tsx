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
  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;
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
          >
            <View
              style={[
                styles.optionWrapper,
                {
                  borderColor:
                    isSelected && isDark
                      ? Colors.dark.green
                      : isSelected
                        ? Colors.light.green
                        : borderColor,
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
                      backgroundColor:
                        isSelected && isDark
                          ? Colors.dark.transparentGreen
                          : isSelected
                            ? Colors.light.transparentGreen
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
                      color={isDark ? Colors.dark.green : Colors.light.green}
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
                  <Text
                    style={[
                      styles.percentageText,
                      {
                        color:
                          isSelected && isDark
                            ? Colors.dark.text
                            : isSelected
                              ? Colors.light.text
                              : Colors.midTone,
                      },
                    ]}
                  >
                    {pct}%
                  </Text>
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
