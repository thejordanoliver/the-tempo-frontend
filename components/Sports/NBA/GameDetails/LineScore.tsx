import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/Styles";
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import LineScoreSkeleton from "../../../Skeletons/GameDetails/LineScoreSkeleton";

// Allow MLB numbers + NBA/CBB strings
type ScoreValue = string | number | null | undefined;

type Props = {
  linescore:
    | {
        home: ScoreValue[];
        away: ScoreValue[];
      }
    | null
    | undefined;
  homeCode: string | undefined;
  awayCode: string | undefined;
  lighter?: boolean;
  loading?: boolean;
  league?: "NBA" | "CBB" | "WCBB" | "MLB"; // <<< MLB ADDED
};

export default function LineScore({
  linescore,
  homeCode,
  awayCode,
  lighter,
  loading,
  league = "NBA",
}: Props) {
  const isDark = useColorScheme() === "dark";

  if (loading || !linescore || !linescore.home || !linescore.away) {
    return <LineScoreSkeleton league={league} />;
  }

  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;

  const borderColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.lightGray;

  // Convert strings | numbers to totals
  const total = (scores: ScoreValue[]) => {
    const numericValues = scores
      .map((v) => {
        if (v === null || v === undefined) return NaN;
        return typeof v === "number" ? v : parseInt(v, 10);
      })
      .filter((n) => !isNaN(n));

    if (numericValues.length === 0) return "-";
    return numericValues.reduce((a, b) => a + b, 0);
  };

  const homeTotal = total(linescore.home);
  const awayTotal = total(linescore.away);

  const renderScore = (score: ScoreValue) =>
    score != null ? String(score) : "-";

  // ------------------------------------------------------------
  // PERIOD LABELS
  // ------------------------------------------------------------

  const numColumns = Math.max(
    league === "CBB" ? 2 : 4,
    linescore.home.length,
    linescore.away.length
  );

  const getPeriodLabel = (index: number): string => {
    // ---------------- MLB ----------------
    if (league === "MLB") {
      return String(index + 1); // 1,2,3,4...
    }

    // ---------------- CBB ----------------
    if (league === "CBB") {
      if (index === 0) return "1H";
      if (index === 1) return "2H";
      if (index === 2) return "OT";
      return `OT${index - 1}`;
    }

    // ---------------- NBA ----------------
    if (index < 4) return `Q${index + 1}`;
    if (index === 4) return "OT";
    return `OT${index - 3}`;
  };

  const columns = Array.from({ length: numColumns }, (_, i) =>
    getPeriodLabel(i)
  );

  const columnStyle: ViewStyle = { flex: 1, alignItems: "center" };

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Score Summary</HeadingTwo>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.teamCode, { color: "transparent" }]}>-</Text>

          <View style={styles.scoresWrapper}>
            {columns.map((label, idx) => (
              <View key={`h-${idx}`} style={columnStyle}>
                <Text style={[styles.header, { color: textColor }]}>
                  {label}
                </Text>
              </View>
            ))}
            <View style={columnStyle}>
              <Text style={[styles.header, { color: textColor }]}>Total</Text>
            </View>
          </View>
        </View>

        {/* Away */}
        <View
          style={[
            styles.row,
            {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
            },
          ]}
        >
          <Text style={[styles.teamCode, { color: textColor }]}>
            {awayCode}
          </Text>
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

        {/* Home */}
        <View style={styles.row}>
          <Text style={[styles.teamCode, { color: textColor }]}>
            {homeCode}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  wrapper: {
    borderColor: Colors.midTone,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
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
});
