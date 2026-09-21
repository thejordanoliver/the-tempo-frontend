import { activeOpacity, Colors, Fonts } from "@/constants/styles";
import { formatDate, formatTime, safeDate } from "@/utils/dateUtils";
import { winnerStyle } from "@/utils/games";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { TennisCompetitor, TennisMatch } from "types/tennis/tennis";

type Props = { match: TennisMatch };

export default function TennisSquareGameCard({ match }: Props) {
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
          {competitor.shortName}
        </Text>
        {competitor.serving && <View style={styles.serveIndicator} />}
      </View>

      <View style={styles.scoreRow}>
        {competitor.linescores.slice(-3).map((setScore) => (
          <Text key={setScore.set} style={styles.setScore}>
            {setScore.displayValue ?? setScore.value ?? "–"}
          </Text>
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
        <View style={styles.header}>
          <Text style={styles.tournament} numberOfLines={1}>
            {match.tournamentShortName || match.tournamentName}
          </Text>
          <Text
            style={[
              styles.status,
              match.status.state === "in" && styles.liveStatus,
            ]}
            numberOfLines={1}
          >
            {status}
          </Text>
        </View>
        <View style={styles.competitors}>{competitors.map(renderCompetitor)}</View>
        {!!match.venue.court && (
          <Text style={styles.meta} numberOfLines={1}>
            {match.venue.court}
          </Text>
        )}
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
      minHeight: 120,
      padding: 10,
      gap: 8,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    header: { gap: 2 },
    tournament: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: textColor,
    },
    status: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
    },
    liveStatus: { color: isDark ? Colors.dark.lightRed : Colors.light.red },
    competitors: { gap: 6 },
    competitorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minWidth: 0,
      gap: 6,
    },
    identity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    flag: { width: 20, height: 20, borderRadius: 10 },
    flagPlaceholder: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: borderColor,
    },
    name: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
    },
    serveIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    scoreRow: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    setScore: {
      width: 12,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    score: {
      minWidth: 16,
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: textColor,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
    meta: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },
  });
};
