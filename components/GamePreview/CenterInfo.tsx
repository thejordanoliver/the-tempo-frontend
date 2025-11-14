import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { getStyles } from "styles/GamePreviewStyles/centerInfoStyles.styles";
import PlayoffsLogo from "../../assets/Logos/NBAPlayoffs.png";
import PlayoffsLogoLight from "../../assets/Logos/NBAPlayoffsLight.png";
import FinalsLogo from "../../assets/Logos/TheNBAFinals.png";
import FinalsLogoLight from "../../assets/Logos/TheNBAFinalsLight.png";

type CenterInfoProps = {
  isNBAFinals: boolean;
  isFinal: boolean;
  isCanceled?: boolean;
  isHalftime?: boolean;
  broadcastNetworks?: string;
  showLiveInfo: boolean;
  period: number | string;
  time: string;
  clock?: string | null;
  endOfPeriod?: boolean;
  formattedDate: string;
  isDark: boolean;
  gameNumberLabel?: string;
  seriesSummary?: string;
  isPlayoffs?: boolean;
  totalPeriodsPlayed?: number;
  lighter: boolean;
};

export default function CenterInfo({
  isNBAFinals,
  isFinal,
  isCanceled,
  isHalftime = false,
  broadcastNetworks,
  showLiveInfo,
  period,
  clock,
  endOfPeriod,
  time,
  formattedDate,
  isDark,
  gameNumberLabel,
  seriesSummary,
  isPlayoffs,
  totalPeriodsPlayed,
  lighter,
}: CenterInfoProps) {
  const lightOpacity = useRef(new Animated.Value(isDark ? 0 : 1)).current;
  const darkOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const styles = getStyles(isDark, lighter);

  const getQuarterLabel = (
    currentPeriod: number | string,
    totalPeriods: number = 4
  ) => {
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
    if (isNBAFinals || isPlayoffs) {
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
  }, [isDark, isNBAFinals, isPlayoffs, lightOpacity, darkOpacity]);

  return (
    <View style={styles.container}>
      {(isNBAFinals || isPlayoffs) && (
        <View style={styles.logoWrapper}>
          <Animated.Image
            source={isNBAFinals ? FinalsLogo : PlayoffsLogo}
            style={[styles.logo, { opacity: lightOpacity }]}
          />
          <Animated.Image
            source={isNBAFinals ? FinalsLogoLight : PlayoffsLogoLight}
            style={[styles.logo, { opacity: darkOpacity }]}
          />
        </View>
      )}

      {(gameNumberLabel || seriesSummary) && (
        <View style={styles.gameInfoRow}>
          {gameNumberLabel && (
            <Text style={styles.gameNumberLabel}>{gameNumberLabel}</Text>
          )}
          {gameNumberLabel && seriesSummary && (
            <View style={styles.statusDivider} />
          )}
          {seriesSummary && (
            <Text style={styles.gameNumberLabel}>{seriesSummary}</Text>
          )}
        </View>
      )}

      {isCanceled ? (
        <Text style={styles.finalText}>Cancelled</Text>
      ) : isFinal ? (
        // 🏁 FINAL GAME — show "Final" and date
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{periodLabel}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
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
        // ⏰ SCHEDULED GAME
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{time}</Text>
        </View>
      )}

      {broadcastNetworks && (
        <Text style={styles.broadcast}>{broadcastNetworks}</Text>
      )}
    </View>
  );
}
