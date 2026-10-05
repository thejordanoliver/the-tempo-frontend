import { Ionicons } from "@expo/vector-icons";
import { Colors, PLACEHOLDER_AVATAR, globalStyles } from "constants/styles";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { fanRankingRowStyles } from "styles/FanPredictionStyles/FanRankingRowStyles";
import type { FanPredictionRanking } from "types/fanPredictions";

type Props = {
  entry: FanPredictionRanking;
  isDark: boolean;
  isCurrentUser?: boolean;
  onPress: () => void;
};

function FanRankingRow({ entry, isDark, isCurrentUser, onPress }: Props) {
  const styles = useMemo(() => fanRankingRowStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
  const accuracy = entry.accuracy == null ? "—" : `${entry.accuracy}%`;
  const incorrect = Math.max(0, entry.graded - entry.correct);
  const rankBadge =
    entry.rank === 1
      ? styles.goldBadge
      : entry.rank === 2
        ? styles.silverBadge
        : entry.rank === 3
          ? styles.bronzeBadge
          : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${entry.username}${isCurrentUser ? ", your record" : ""}, rank ${entry.rank ?? "unranked"}, ${entry.correct} correct picks, ${incorrect} incorrect picks, ${entry.accuracy == null ? "no scored accuracy yet" : `${accuracy} accuracy`}, ${entry.graded} scored, ${entry.pending} pending`}
      style={({ pressed }) => [
        styles.row,
        isCurrentUser && styles.currentUser,
        pressed && global.pressed,
      ]}
    >
      <View style={[styles.rankBadge, rankBadge]}>
        <Text style={styles.rank}>{entry.rank ?? "—"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <Image
            source={entry.profileImage || PLACEHOLDER_AVATAR}
            style={styles.avatar}
          />
          <Text numberOfLines={1} style={styles.name}>
            {entry.username}
          </Text>
          {isCurrentUser ? (
            <View style={styles.youBadge}>
              <Text style={styles.youLabel}>You</Text>
            </View>
          ) : null}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.icon}
            accessible={false}
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {entry.correct.toLocaleString()}/{entry.graded.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Record</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{accuracy}</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {entry.pending.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(FanRankingRow);
