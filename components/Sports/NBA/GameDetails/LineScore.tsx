import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { lineScoreStyles } from "styles/GameDetailStyles/LineScoreStyles";
import LineScoreSkeleton from "../../../Skeletons/GameDetails/LineScoreSkeleton";
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
  isDark: boolean;
  loading?: boolean;
  league?: string;
  gameStatusDescription: string | undefined;
};

export default function LineScore({
  linescore,
  homeCode,
  awayCode,
  isDark,
  loading,
  league = "nba",
  gameStatusDescription,
}: Props) {
  const styles = lineScoreStyles(isDark);

  const textColor = isDark ? Colors.white : Colors.black;
  const borderColor = isDark ? Colors.midTone : Colors.lightGray;

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

  const homeScores = linescore?.home ?? [];
  const awayScores = linescore?.away ?? [];

  const homeTotal = total(homeScores);
  const awayTotal = total(awayScores);

  const renderScore = (score: ScoreValue) =>
    score != null ? String(score) : "-";

  const baseColumns =
    league === "soccer"
      ? 2
      : league === "cbb"
        ? 2
        : league === "nhl"
          ? 3
          : league === "mlb"
            ? 9
            : league === "cb"
              ? 9
              : league === "sb"
                ? 7
                : 4;

  const numColumns = Math.max(
    baseColumns,
    homeScores.length,
    awayScores.length,
  );

  const getPeriodLabel = (index: number): string => {
    // ---------------- mlb ----------------
    if (league === "mlb" || league === "cb") {
      return `${index + 1}`;
    }

    if (league === "sb") {
      return String(index + 1);
    }

    // ---------------- nhl ----------------
    if (league === "nhl") {
      if (index < 3) return `${index + 1}`;
      if (index === 3) return "OT";
      return `${index - 2}OT`;
    }

    // ---------------- cbb ----------------
    if (league === "cbb" || league === "soccer") {
      if (index === 0) return "1";
      if (index === 1) return "2";
      if (index === 2) return "OT";
      return `${index - 1}OT`;
    }

    if (index < 4) return `${index + 1}`;
    if (index === 4) return "OT";
    return `${index - 3}OT`;
  };

  const columns = Array.from({ length: numColumns }, (_, i) =>
    getPeriodLabel(i),
  );

  const columnStyle: ViewStyle = { flex: 1, alignItems: "center" };

  if (loading) {
    return <LineScoreSkeleton league={league} />;
  }

  if (!linescore || gameStatusDescription === "Scheduled") return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Score Summary</HeadingTwo>
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
