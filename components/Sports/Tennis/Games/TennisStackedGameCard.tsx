import { activeOpacity, Colors, Fonts } from "@/constants/styles";
import { formatDate, formatTime, safeDate } from "@/utils/dateUtils";
import { winnerStyle } from "@/utils/games";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { TennisCompetitor, TennisMatch } from "types/tennis/tennis";

type Props = { match: TennisMatch };

export default function TennisStackedGameCard({ match }: Props) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);
  const competitors = match.competitors.slice(0, 2);
  const isScheduled = match.status.state === "pre";
  const isTie =
    Boolean(competitors[0]?.winner) === Boolean(competitors[1]?.winner);
  const gameDate = safeDate(match.date);
  const status =
    match.status.state === "pre"
      ? `${formatDate(gameDate)} · ${
          match.status.detail?.includes("TBD") ? "TBD" : formatTime(gameDate)
        }`
      : match.status.detail || match.status.description || "Tennis";

  const handlePress = () => {
    router.push({
      pathname: "/game/tennis/[game]",
      params: {
        game: match.id,
        data: encodeURIComponent(JSON.stringify(match)),
      },
    });
  };

  const renderCompetitor = (competitor: TennisCompetitor) => (
    <View key={competitor.id ?? competitor.uid} style={styles.competitorRow}>
      <View style={styles.identity}>
        {competitor.flag ? (
          <Image
            source={{ uri: competitor.flag }}
            style={styles.flag}
            contentFit="cover"
            accessibilityLabel={competitor.country ?? "Country flag"}
          />
        ) : (
          <View style={styles.flagPlaceholder} />
        )}
        <Text style={styles.name} numberOfLines={1}>
          {competitor.rank ? `${competitor.rank} ` : ""}
          {competitor.displayName || competitor.shortName}
        </Text>
        {competitor.serving && <View style={styles.serveIndicator} />}
      </View>

      <View style={styles.scoreRow}>
        {competitor.linescores.slice(-5).map((setScore) => (
          <View key={setScore.set} style={styles.setScoreGroup}>
            <Text style={styles.setScore}>
              {setScore.displayValue ?? setScore.value ?? "–"}
            </Text>
            {setScore.tiebreak != null && (
              <Text style={styles.tiebreak}>{setScore.tiebreak}</Text>
            )}
          </View>
        ))}
        {!isScheduled && (
          <Text
            style={[
              styles.score,
              winnerStyle({
                isWinner: Boolean(competitor.winner),
                isDark,
                isTie,
              }),
            ]}
          >
            {competitor.score}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <TouchableOpacity activeOpacity={activeOpacity} onPress={handlePress}>
      <View style={styles.card}>
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.tournament} numberOfLines={1}>
              {match.tournamentName}
            </Text>
            <Text style={styles.round} numberOfLines={1}>
              {match.round.name}
            </Text>
          </View>
          <View style={styles.competitors}>{competitors.map(renderCompetitor)}</View>
        </View>
        <View style={styles.statusColumn}>
          <Text
            style={[
              styles.status,
              match.status.state === "in" && styles.liveStatus,
            ]}
            numberOfLines={2}
          >
            {status}
          </Text>
          {!!match.venue.court && (
            <Text style={styles.meta} numberOfLines={1}>
              {match.venue.court}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    card: {
      minHeight: 94,
      flexDirection: "row",
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    main: {
      flex: 1,
      minWidth: 0,
      gap: 6,
      paddingRight: 12,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: borderColor,
    },
    header: { flexDirection: "row", minWidth: 0, gap: 6 },
    tournament: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: textColor,
    },
    round: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
    },
    competitors: { gap: 6 },
    competitorRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
      gap: 8,
    },
    identity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    flag: { width: 24, height: 24, borderRadius: 12 },
    flagPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: borderColor,
    },
    name: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: textColor,
    },
    serveIndicator: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    scoreRow: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    setScoreGroup: { minWidth: 14, alignItems: "center" },
    setScore: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: subTextColor,
      fontVariant: ["tabular-nums"],
    },
    tiebreak: {
      position: "absolute",
      top: -5,
      right: -3,
      fontFamily: Fonts.REGULAR,
      fontSize: 7,
      color: subTextColor,
    },
    score: {
      minWidth: 20,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    statusColumn: {
      width: 96,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingLeft: 12,
    },
    status: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: textColor,
      textAlign: "center",
    },
    liveStatus: { color: isDark ? Colors.dark.lightRed : Colors.light.red },
    meta: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },
  });
};
