import { Fonts } from "constants/fonts";
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import HeadingTwo from "../Headings/HeadingTwo";
import LineScoreSkeleton from "./LineScoreSkeleton";

type Props = {
  linescore:
    | {
        home: (string | null | undefined)[];
        away: (string | null | undefined)[];
      }
    | null
    | undefined;
  homeCode: string | undefined;
  awayCode: string | undefined;
  lighter?: boolean;
  loading?: boolean; 
  league?: "NBA" | "CBB"; // ✅ NEW
};

export default function LineScore({
  linescore,
  homeCode,
  awayCode,
  lighter,
  loading,
  league = "NBA", // defaults to NBA for backward compatibility
}: Props) {
  const isDark = useColorScheme() === "dark";

  if (loading || !linescore || !linescore.home || !linescore.away) {
    return <LineScoreSkeleton />;
  }

  const textColor = lighter ? "#fff" : isDark ? "#fff" : "#000";
  const borderColor = lighter ? "#aaa" : isDark ? "#333" : "#888";
  const dividerColor = lighter ? "#bbb" : isDark ? "#888" : "#888";

  const total = (scores: (string | null | undefined)[]) => {
    const numericValues = scores
      .map((v) => (v != null ? parseInt(v, 10) : NaN))
      .filter((n) => !isNaN(n));

    if (numericValues.length === 0) return "-";
    return numericValues.reduce((a, b) => a + b, 0);
  };

  const homeTotal = total(linescore.home);
  const awayTotal = total(linescore.away);

  const renderScore = (score: string | null | undefined) =>
    score != null ? score : "-";

  // ------------------------------------------------------------
  // 🧠 QUARTERS / PERIOD LABEL LOGIC
  // ------------------------------------------------------------

  const numColumns = Math.max(
    league === "CBB" ? 2 : 4, // CBB always minimum 2 (1H, 2H)
    linescore.home.length,
    linescore.away.length
  );

  const getPeriodLabel = (index: number) => {
    if (league === "CBB") {
      if (index === 0) return "1H";
      if (index === 1) return "2H";
      if (index === 2) return "OT";
      return `OT${index - 1}`;
    }

    // NBA default
    if (index < 4) return `Q${index + 1}`;
    if (index === 4) return "OT";
    return `OT${index - 3}`;
  };

  const columns = Array.from({ length: numColumns }, (_, i) =>
    getPeriodLabel(i)
  );

  const columnStyle: ViewStyle = { flex: 1, alignItems: "center" };

  return (
    <View style={[styles.container, { borderColor }]}>
      <HeadingTwo style={{ marginBottom: 12 }} lighter={lighter}>
        Score Summary
      </HeadingTwo>

      {/* Header */}
      <View style={styles.row}>
        <Text style={[styles.teamCode, { color: "transparent" }]}>-</Text>

        <View style={styles.scoresWrapper}>
          {columns.map((label, idx) => (
            <View key={`h-${idx}`} style={columnStyle}>
              <Text style={[styles.header, { color: textColor }]}>{label}</Text>
            </View>
          ))}
          <View style={columnStyle}>
            <Text style={[styles.header, { color: textColor }]}>Total</Text>
          </View>
        </View>
      </View>

      {/* Away */}
      <View style={styles.row}>
        <Text style={[styles.teamCode, { color: textColor }]}>{awayCode}</Text>
        <View style={styles.scoresWrapper}>
          {columns.map((_, idx) => (
            <View key={`away-${idx}`} style={columnStyle}>
              <Text style={[styles.score, { color: textColor }]}>
                {renderScore(linescore.away[idx])}
              </Text>
            </View>
          ))}
          <View style={columnStyle}>
            <Text style={[styles.totalScore, { color: textColor }]}>
              {awayTotal}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Home */}
      <View style={styles.row}>
        <Text style={[styles.teamCode, { color: textColor }]}>{homeCode}</Text>
        <View style={styles.scoresWrapper}>
          {columns.map((_, idx) => (
            <View key={`home-${idx}`} style={columnStyle}>
              <Text style={[styles.score, { color: textColor }]}>
                {renderScore(linescore.home[idx])}
              </Text>
            </View>
          ))}
          <View style={columnStyle}>
            <Text style={[styles.totalScore, { color: textColor }]}>
              {homeTotal}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamCode: {
    width: 48,
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 14,
    paddingLeft: 8,
  },
  scoresWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  header: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 10,
    opacity: 0.8,
    textAlign: "center",
  },
  score: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 14,
    textAlign: "center",
  },
  totalScore: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 14,
    textAlign: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
});
