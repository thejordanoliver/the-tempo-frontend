import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { FanPredictionHistoryRowStyles } from "styles/FanPredictionStyles/FanPredictionHistoryRowStyles";
import type { FanPredictionPick } from "types/fanPredictions";
import { isUnavailablePrediction } from "utils/games/predictionAvailability";
import PredictionGameSummary from "./PredictionGameSummary";

type Props = { pick: FanPredictionPick; isDark: boolean; onPress: () => void };

function FanPredictionHistoryRow({ pick, isDark, onPress }: Props) {
  const styles = useMemo(() => FanPredictionHistoryRowStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
  const outcome =
    pick.outcome === "void"
      ? "Not scored"
      : pick.outcome.charAt(0).toUpperCase() + pick.outcome.slice(1);
  const outcomeColor =
    pick.outcome === "correct"
      ? colors.green
      : pick.outcome === "incorrect"
        ? isDark
          ? Colors.dark.lightRed
          : Colors.light.red
        : colors.icon;

  const isUnavailable = isUnavailablePrediction(pick);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pick.matchup}, picked ${pick.pickedName}, ${outcome}`}
      accessibilityHint={
        isUnavailable ? "Game details unavailable" : "Open game details"
      }
      accessibilityState={{ disabled: isUnavailable }}
      disabled={isUnavailable}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && global.pressed]}
    >
      <PredictionGameSummary pick={pick} isDark={isDark} />
      <View style={styles.footer}>
        <Text style={styles.pickSummary} numberOfLines={1}>
          Picked {pick.pickedShortName}
        </Text>
        <View
          style={[
            styles.outcomeBadge,
            {
              backgroundColor:
                pick.outcome === "correct"
                  ? colors.transparentGreen
                  : pick.outcome === "incorrect"
                    ? isDark
                      ? Colors.dark.transparentLightRed
                      : Colors.light.transparentRed
                    : colors.transparentItemBackground,
            },
          ]}
        >
          <Ionicons
            name={
              pick.outcome === "correct"
                ? "checkmark-circle"
                : pick.outcome === "incorrect"
                  ? "close-circle"
                  : pick.outcome === "pending"
                    ? "time-outline"
                    : "remove-circle-outline"
            }
            size={13}
            color={outcomeColor}
          />
          <Text style={[styles.outcome, { color: outcomeColor }]}>
            {outcome}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.icon} />
      </View>
    </Pressable>
  );
}

export default memo(FanPredictionHistoryRow);
