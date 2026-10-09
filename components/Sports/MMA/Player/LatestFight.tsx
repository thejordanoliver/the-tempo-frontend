import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet, Text, View } from "react-native";
import type { MMAFightLogEntry } from "types/mma/fightLog";

type Props = { fight: MMAFightLogEntry | null; loading: boolean; error: string | null; isDark: boolean };
const resultLabels = { W: "Win", L: "Loss", D: "Draw", NC: "No contest" };

export default function LatestFight({ fight, loading, error, isDark }: Props) {
  const global = globalStyles(isDark);
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Latest Fight</HeadingTwo>
      {loading ? <GameCardSkeleton /> : error || !fight ? (
        <Text style={global.emptyText}>{error ?? "No recent fight available."}</Text>
      ) : (
        <View style={[styles.card, { borderColor: isDark ? Colors.darkGray : Colors.lightGray, backgroundColor: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground }]}>
          <Text style={[global.text, styles.event]}>{fight.eventName || "—"}</Text>
          <Text style={global.text}>{fight.date ? new Date(fight.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—"}</Text>
          <Text style={[global.text, styles.opponent]}>vs. {fight.opponent.name || "—"}</Text>
          <Text style={global.text}>{fight.result ? resultLabels[fight.result] : "—"} · {fight.method ?? "—"}</Text>
          <Text style={global.text}>Round {fight.round ?? "—"} · {fight.time ?? "—"}{fight.titleFight ? " · Title fight" : ""}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  card: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 4 },
  event: { fontFamily: Fonts.BOLD },
  opponent: { fontFamily: Fonts.BOLD, fontSize: 20, marginVertical: 4 },
});
