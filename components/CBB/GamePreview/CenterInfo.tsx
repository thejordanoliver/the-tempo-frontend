import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/centerInfoStyles.styles";

type CenterInfoProps = {
  isChampionship: boolean;
  isFinalFour: boolean;
  isFinal: boolean;
  isCanceled?: boolean;
  isHalftime?: boolean;
  isScheduled?: boolean; // ✅ Added
  broadcastNetworks?: string;
  showLiveInfo: boolean;
  period: number | string;
  time: string;
  clock?: string | null;
  endOfPeriod?: boolean;
  formattedDate: string;
  isDark: boolean;
  round?: string;
  isMarchMadness?: boolean;
  totalPeriodsPlayed?: number;
  lighter: boolean;
};

export default function CenterInfo({
  isChampionship,
  isFinalFour,
  isFinal,
  isCanceled,
  isHalftime,
  isScheduled, // ✅ Added
  broadcastNetworks,
  showLiveInfo,
  period,
  clock,
  endOfPeriod,
  time,
  formattedDate,
  isDark,
  round,
  isMarchMadness,
  totalPeriodsPlayed,

  lighter,
}: CenterInfoProps) {
  const lightOpacity = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const darkOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const styles = getStyles;

  const getQuarterLabel = (
    currentPeriod: number | string,
    totalPeriods: number = 4
  ) => {
    if (typeof currentPeriod === "string") {
      const lower = currentPeriod.toLowerCase();

      if (lower.startsWith("ot")) {
        // Return exactly what was passed (OT, OT2, OT3, etc.)
        return { label: currentPeriod.toUpperCase() };
      }

      if (["halftime", "final"].includes(lower)) {
        return {
          label: currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1),
        };
      }
    }

    const periodNum =
      typeof currentPeriod === "number"
        ? currentPeriod
        : parseInt(currentPeriod as string);

    if (isNaN(periodNum)) return { label: "Live" };

    switch (periodNum) {
      case 1:
        return { label: "1st" };
      case 2:
        return { label: "2nd" };
      case 3:
        return { label: "3rd" };
      case 4:
        return { label: "4th" };
      default:
        const otNumber = periodNum - totalPeriods;
        return { label: `OT${otNumber}` };
    }
  };

  const { label: periodLabelRaw } = getQuarterLabel(period, totalPeriodsPlayed);
  const periodLabel = isFinal && !isCanceled ? "Final" : periodLabelRaw;

  useEffect(() => {
    if (isChampionship || isMarchMadness) {
      Animated.parallel([
        Animated.timing(lightOpacity, {
          toValue: isDark ? 0 : 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(darkOpacity, {
          toValue: isDark ? 1 : 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDark, isChampionship, isMarchMadness, lightOpacity, darkOpacity]);

  return (
    <View style={styles.container}>
      {isCanceled ? (
        <Text style={styles.finalText}>Cancelled</Text>
      ) : isFinal ? (
        // 🏁 FINAL GAME — show "Final" and date
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{periodLabel}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      ) : isScheduled ? (
        // ⏰ SCHEDULED GAME
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      ) : showLiveInfo || isHalftime ? (
        // 🕒 LIVE or HALFTIME
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>
            {isHalftime
              ? "Halftime"
              : endOfPeriod
              ? `End of ${periodLabelRaw}`
              : periodLabelRaw}
          </Text>
          {!isHalftime && !endOfPeriod && <View style={styles.statusDivider} />}
          {!endOfPeriod && !isHalftime && clock && (
            <Text style={styles.clock}>{clock}</Text>
          )}
        </View>
      ) : (
        // 🏁 FINAL or fallback
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{periodLabel}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      )}

      {broadcastNetworks && (
        <Text style={styles.broadcast}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}
