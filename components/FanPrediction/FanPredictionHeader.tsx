import { Ionicons } from "@expo/vector-icons";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { FanPredictionStyles } from "styles/FanPredictionStyles/FanPredictionStyles";
import type { FanPredictionScoring } from "types/fanPredictions";

const BONUS_LABELS = {
  rivalry: "Rivalry game",
  ranked: "Ranked matchup",
  playoff: "Playoff game",
  championship: "Championship game",
  knockout: "Tournament knockout",
};

type Props = {
  isDark: boolean;
  canVote: boolean;
  isLive: boolean;
  hasPick: boolean;
  scoring?: FanPredictionScoring | null;
  scoringError?: boolean;
  retryScoring?: () => void;
};

export default function FanPredictionHeader({
  isDark,
  canVote,
  isLive,
  hasPick,
  scoring,
  scoringError,
  retryScoring,
}: Props) {
  const styles = useMemo(() => FanPredictionStyles(isDark), [isDark]);
  const theme = isDark ? Colors.dark : Colors.light;
  const hasBonus = scoring?.pointsValue === 2;
  const bonusLabel =
    hasBonus && scoring.bonusReason ? BONUS_LABELS[scoring.bonusReason] : null;

  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.prompt}>
          {canVote
            ? hasPick
              ? "Your pick is in"
              : "Who wins?"
            : isLive
              ? "The fan vote"
              : "Final fan picks"}
        </Text>
        <Text style={styles.headerHint}>
          {canVote
            ? (bonusLabel ?? "Picks lock at game time")
            : "Voting is closed"}
        </Text>
      </View>
      {canVote &&
        (scoring ? (
          <View
            style={[styles.pointsBadge, hasBonus && styles.bonusPointsBadge]}
          >
            <Ionicons
              name={hasBonus ? "flash" : "trophy-outline"}
              size={13}
              color={hasBonus ? theme.green : theme.text}
              accessible={false}
            />
            <Text style={[styles.pointsText, hasBonus && styles.bonusText]}>
              {hasBonus ? "2× points" : "1 point"}
            </Text>
          </View>
        ) : scoringError ? (
          <Pressable
            onPress={retryScoring}
            accessibilityRole="button"
            accessibilityLabel="Retry loading prediction points"
            style={styles.pointsRetry}
          >
            <Text style={styles.pointsRetryText}>Retry points</Text>
          </Pressable>
        ) : (
          <SkeletonBlock width={76} height={30} radius={6} />
        ))}
    </View>
  );
}
