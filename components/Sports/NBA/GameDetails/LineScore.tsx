import { useMemo, useState } from "react";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
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
  state: string | undefined;

  homeRuns?: ScoreValue;
  awayRuns?: ScoreValue;
  homeHits?: ScoreValue;
  awayHits?: ScoreValue;
  homeErrors?: ScoreValue;
  awayErrors?: ScoreValue;
};

const BASEBALL_TEAM_WIDTH = 54;
const BASEBALL_RHE_CELL_WIDTH = 28;
const BASEBALL_RHE_WIDTH = BASEBALL_RHE_CELL_WIDTH * 3;
const BASEBALL_MIN_INNING_WIDTH = 22;
const BASEBALL_MAX_INNING_WIDTH = 36;

export default function LineScore({
  linescore,
  homeCode,
  awayCode,
  isDark,
  loading,
  league = "nba",
  state,

  homeRuns,
  awayRuns,
  homeHits,
  awayHits,
  homeErrors,
  awayErrors,
}: Props) {
  const styles = lineScoreStyles(isDark);
  const [baseballTableWidth, setBaseballTableWidth] = useState(0);

  const textColor = isDark ? Colors.white : Colors.black;
  const borderColor = isDark ? Colors.midTone : Colors.lightGray;

  const normalizedLeague = league.toLowerCase();

  const isBaseball =
    normalizedLeague === "mlb" ||
    normalizedLeague === "cb" ||
    normalizedLeague === "sb";

  const renderScore = (score: ScoreValue) =>
    score !== null && score !== undefined ? String(score) : "-";

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

  const baseColumns =
    normalizedLeague === "soccer"
      ? 2
      : normalizedLeague === "cbb"
        ? 2
        : normalizedLeague === "nhl"
          ? 3
          : normalizedLeague === "mlb"
            ? 9
            : normalizedLeague === "cb"
              ? 9
              : normalizedLeague === "sb"
                ? 7
                : 4;

  const numColumns = Math.max(
    baseColumns,
    homeScores.length,
    awayScores.length,
  );

  const getPeriodLabel = (index: number): string => {
    if (normalizedLeague === "mlb" || normalizedLeague === "cb") {
      return `${index + 1}`;
    }

    if (normalizedLeague === "sb") {
      return String(index + 1);
    }

    if (normalizedLeague === "nhl") {
      if (index < 3) return `${index + 1}`;
      if (index === 3) return "OT";
      return `${index - 2}OT`;
    }

    if (normalizedLeague === "cbb") {
      if (index === 0) return "1";
      if (index === 1) return "2";
      if (index === 2) return "OT";
      return `${index - 1}OT`;
    }

    if (normalizedLeague === "soccer") {
      if (index === 0) return "1";
      if (index === 1) return "2";
      if (index === 2) return "ET";
      if (index === 3) return "ET";
      if (index === 4) return "Pens";
      return `${index - 1}`;
    }

    if (index < 4) return `${index + 1}`;
    if (index === 4) return "OT";
    return `${index - 3}OT`;
  };

  const columns = Array.from({ length: numColumns }, (_, i) =>
    getPeriodLabel(i),
  );

  const baseballInningWidth = useMemo(() => {
    if (!baseballTableWidth || columns.length === 0) {
      return BASEBALL_MIN_INNING_WIDTH;
    }

    const fixedWidth = BASEBALL_TEAM_WIDTH + BASEBALL_RHE_WIDTH;
    const availableWidth = baseballTableWidth - fixedWidth;

    if (availableWidth <= 0) {
      return BASEBALL_MIN_INNING_WIDTH;
    }

    const fittedWidth = Math.floor(availableWidth / columns.length);

    return Math.max(
      BASEBALL_MIN_INNING_WIDTH,
      Math.min(BASEBALL_MAX_INNING_WIDTH, fittedWidth),
    );
  }, [baseballTableWidth, columns.length]);

  const baseballInningsContentWidth = baseballInningWidth * columns.length;

  const columnStyle: ViewStyle = {
    flex: 1,
    alignItems: "center",
  };

  const baseballColumnStyle: ViewStyle = {
    width: baseballInningWidth,
    alignItems: "center",
    justifyContent: "center",
  };

  const handleBaseballTableLayout = (event: LayoutChangeEvent) => {
    setBaseballTableWidth(event.nativeEvent.layout.width);
  };

  if (loading) {
    return <LineScoreSkeleton league={league} />;
  }

  if (!linescore || (state !== "in" && state !== "post")) return null;

  if (isBaseball) {
    return (
      <View style={styles.container}>
        <HeadingTwo isDark={isDark}>Score Summary</HeadingTwo>

        <View style={styles.wrapper}>
          <View
            style={baseballStyles.table}
            onLayout={handleBaseballTableLayout}
          >
            {/* Fixed Team Column */}
            <View style={baseballStyles.teamColumn}>
              <View style={baseballStyles.headerCell}>
                <Text style={[styles.teamCode, baseballStyles.hiddenText]}>
                  -
                </Text>
              </View>

              <View
                style={[
                  baseballStyles.teamCell,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.teamCode, { color: textColor }]}
                >
                  {awayCode}
                </Text>
              </View>

              <View style={baseballStyles.teamCell}>
                <Text
                  numberOfLines={1}
                  style={[styles.teamCode, { color: textColor }]}
                >
                  {homeCode}
                </Text>
              </View>
            </View>

            {/* Scrollable Innings Only */}
            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={false}
              style={baseballStyles.inningsScroll}
              contentContainerStyle={[
                baseballStyles.inningsContent,
                { width: baseballInningsContentWidth },
              ]}
            >
              <View>
                <View style={baseballStyles.headerRow}>
                  {columns.map((label, idx) => (
                    <View
                      key={`baseball-header-${idx}`}
                      style={baseballColumnStyle}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.header, { color: textColor }]}
                      >
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    baseballStyles.scoreRow,
                    {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  {columns.map((_, idx) => (
                    <View
                      key={`baseball-away-${idx}`}
                      style={baseballColumnStyle}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.score, { color: textColor }]}
                      >
                        {renderScore(linescore.away[idx])}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={baseballStyles.scoreRow}>
                  {columns.map((_, idx) => (
                    <View
                      key={`baseball-home-${idx}`}
                      style={baseballColumnStyle}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.score, { color: textColor }]}
                      >
                        {renderScore(linescore.home[idx])}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Fixed R/H/E Column */}
            <View
              style={[
                baseballStyles.rheColumn,
                {
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderLeftColor: borderColor,
                },
              ]}
            >
              <View style={baseballStyles.rheHeaderRow}>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.header, { color: textColor }]}>R</Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.header, { color: textColor }]}>H</Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.header, { color: textColor }]}>E</Text>
                </View>
              </View>

              <View
                style={[
                  baseballStyles.rheScoreRow,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  },
                ]}
              >
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.totalScore, { color: textColor }]}>
                    {renderScore(awayRuns)}
                  </Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.score, { color: textColor }]}>
                    {renderScore(awayHits)}
                  </Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.score, { color: textColor }]}>
                    {renderScore(awayErrors)}
                  </Text>
                </View>
              </View>

              <View style={baseballStyles.rheScoreRow}>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.totalScore, { color: textColor }]}>
                    {renderScore(homeRuns)}
                  </Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.score, { color: textColor }]}>
                    {renderScore(homeHits)}
                  </Text>
                </View>
                <View style={baseballStyles.rheCell}>
                  <Text style={[styles.score, { color: textColor }]}>
                    {renderScore(homeErrors)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Score Summary</HeadingTwo>

      <View style={styles.wrapper}>
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

const baseballStyles = StyleSheet.create({
  table: {
    width: "100%",
    flexDirection: "row",
    overflow: "hidden",
  },
  teamColumn: {
    width: BASEBALL_TEAM_WIDTH,
    flexShrink: 0,
  },
  headerCell: {
    height: 34,
    justifyContent: "center",
  },
  teamCell: {
    height: 42,
    justifyContent: "center",
    paddingLeft: 2,
  },
  hiddenText: {
    color: "transparent",
  },
  inningsScroll: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
  },
  inningsContent: {
    flexGrow: 0,
  },
  headerRow: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
  },
  scoreRow: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },
  rheColumn: {
    width: BASEBALL_RHE_WIDTH,
    flexShrink: 0,
  },
  rheHeaderRow: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
  },
  rheScoreRow: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },
  rheCell: {
    width: BASEBALL_RHE_CELL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
});