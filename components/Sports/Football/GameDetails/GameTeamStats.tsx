import {
  Team,
  TeamBoxScoreStat,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { useEffect, useRef, useState } from "react";
import type { DimensionValue } from "react-native";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { gameTeamStatsStyles } from "styles/GameDetailStyles/GameTeamStatsStyles";

const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

type StatType = "number" | "time";

type StatConfig = {
  key: string;
  label: string;
  type: StatType;
};

type MappedStat = {
  name: string;
  value: TeamBoxScoreStat["value"];
  displayValue: string | null;
  label: string | null;
};

const STAT_KEYS: StatConfig[] = [
  {
    key: "firstDowns",
    label: "First Downs",
    type: "number",
  },
  {
    key: "firstDownsPassing",
    label: "Passing First Downs",
    type: "number",
  },
  {
    key: "firstDownsRushing",
    label: "Rushing First Downs",
    type: "number",
  },
  {
    key: "firstDownsPenalty",
    label: "First Downs From Penalties",
    type: "number",
  },
  {
    key: "thirdDownEff",
    label: "Third Down Efficiency",
    type: "number",
  },
  {
    key: "fourthDownEff",
    label: "Fourth Down Efficiency",
    type: "number",
  },
  {
    key: "totalOffensivePlays",
    label: "Total Plays",
    type: "number",
  },
  {
    key: "totalYards",
    label: "Total Yards",
    type: "number",
  },
  {
    key: "yardsPerPlay",
    label: "Yards per Play",
    type: "number",
  },
  {
    key: "totalDrives",
    label: "Total Drives",
    type: "number",
  },
  {
    key: "netPassingYards",
    label: "Passing",
    type: "number",
  },
  {
    key: "completionAttempts",
    label: "Comp/Att",
    type: "number",
  },
  {
    key: "yardsPerPass",
    label: "Yards per Pass",
    type: "number",
  },
  {
    key: "interceptions",
    label: "Interceptions Thrown",
    type: "number",
  },
  {
    key: "sacksYardsLost",
    label: "Sacks-Yards Lost",
    type: "number",
  },
  {
    key: "rushingYards",
    label: "Rushing",
    type: "number",
  },
  {
    key: "rushingAttempts",
    label: "Rushing Attempts",
    type: "number",
  },
  {
    key: "yardsPerRushAttempt",
    label: "Yards per Rush",
    type: "number",
  },
  {
    key: "redZoneAttempts",
    label: "Red Zone (Made-Att)",
    type: "number",
  },
  {
    key: "totalPenaltiesYards",
    label: "Penalties",
    type: "number",
  },
  {
    key: "turnovers",
    label: "Turnovers",
    type: "number",
  },
  {
    key: "fumblesLost",
    label: "Fumbles Lost",
    type: "number",
  },
  {
    key: "defensiveTouchdowns",
    label: "Defensive / Special Teams TDs",
    type: "number",
  },
  {
    key: "possessionTime",
    label: "Time of Possession",
    type: "time",
  },
];

function extractTimeInSeconds(value?: string | null) {
  if (!value || !value.includes(":")) {
    return 0;
  }

  const parts = value.split(":").map(Number);

  if (parts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;

    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;

    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

function extractNumber(value?: string | null, type: StatType = "number") {
  if (!value || value === "-") {
    return 0;
  }

  if (type === "time") {
    return extractTimeInSeconds(value);
  }

  const normalizedValue = value.replace(/,/g, "").trim();

  if (normalizedValue.includes("-")) {
    const [firstValue] = normalizedValue.split("-");

    return Number(firstValue) || 0;
  }

  if (normalizedValue.includes("/")) {
    const [firstValue] = normalizedValue.split("/");

    return Number(firstValue) || 0;
  }

  return Number(normalizedValue) || 0;
}

function mapStats(teamStats: TeamBoxScoreStat[]) {
  return Object.fromEntries(
    teamStats.map((stat) => [
      stat.name,
      {
        name: stat.name,
        value: stat.value,
        displayValue:
          stat.displayValue !== null && stat.displayValue !== undefined
            ? String(stat.displayValue)
            : null,
        label:
          stat.label !== null && stat.label !== undefined
            ? String(stat.label)
            : null,
      },
    ]),
  ) as Record<string, MappedStat>;
}

function getNumericStatValue(stat: MappedStat | undefined, type: StatType) {
  if (!stat) {
    return 0;
  }

  if (typeof stat.value === "number" && Number.isFinite(stat.value)) {
    return stat.value;
  }

  if (
    typeof stat.value === "string" &&
    stat.value.trim() !== "" &&
    stat.value.trim() !== "-"
  ) {
    const numericValue = Number(stat.value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return extractNumber(stat.displayValue, type);
}

function getDisplayStatValue(stat: MappedStat | undefined) {
  if (
    stat?.displayValue !== null &&
    stat?.displayValue !== undefined &&
    stat.displayValue !== ""
  ) {
    return stat.displayValue;
  }

  if (stat?.value !== null && stat?.value !== undefined && stat.value !== "") {
    return String(stat.value);
  }

  return "-";
}

function getBarWidth(value: number, max: number): DimensionValue {
  if (!Number.isFinite(value) || value <= 0 || max <= 0) {
    return "0%";
  }

  const percentage = Math.max(0, Math.min((value / max) * 100, 100));

  return `${percentage}%` as DimensionValue;
}

export default function GameTeamStats({
  teamStats,
  state,
  awayLogo,
  homeLogo,
  awayColor,
  homeColor,
  awayCode,
  homeCode,
  isDark,
}: {
  awayLogo: any;
  homeLogo: any;
  awayColor: string;
  homeColor: string;
  awayCode: string;
  homeCode: string;
  state?: string;
  teamStats: {
    team: Team;
    stats: TeamBoxScoreStat[];
  }[];
  isDark: boolean;
}) {
  const styles = gameTeamStatsStyles(isDark);
  const isScheduled = state === "pre";

  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  const heightAnim = useRef(
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT),
  ).current;

  useEffect(() => {
    const toValue = expanded ? fullHeight : COLLAPSED_ROWS * ROW_HEIGHT;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, fullHeight, heightAnim]);

  if (!Array.isArray(teamStats) || teamStats.length < 2) {
    return null;
  }

  const away = teamStats[0];
  const home = teamStats[1];

  const awayStats = mapStats(away.stats);
  const homeStats = mapStats(home.stats);
  const awayHasStats = Array.isArray(away.stats) && away.stats.length > 0;
  const homeHasStats = Array.isArray(home.stats) && home.stats.length > 0;

  const renderStatRow = (statConfig: StatConfig, hidden = false) => {
    const { key, label, type } = statConfig;

    const awayStat = awayStats[key];
    const homeStat = homeStats[key];

    const awayDisplayValue = getDisplayStatValue(awayStat);
    const homeDisplayValue = getDisplayStatValue(homeStat);

    const awayNum = getNumericStatValue(awayStat, type);
    const homeNum = getNumericStatValue(homeStat, type);

    const awayWins = awayNum > homeNum;
    const homeWins = homeNum > awayNum;
    const isTie = awayNum === homeNum;

    const max = Math.max(awayNum, homeNum, 1);

    const awayWidth = getBarWidth(awayNum, max);
    const homeWidth = getBarWidth(homeNum, max);

    return (
      <View key={key} style={styles.statSection}>
        <Text style={styles.statLabel}>{label}</Text>

        <View style={styles.row}>
          <Text
            style={[
              styles.barText,
              !hidden && {
                opacity: isTie || awayWins ? 1 : 0.4,
              },
            ]}
          >
            {awayDisplayValue}
          </Text>

          <View style={styles.barContainerLeft}>
            {hidden ? (
              <View
                style={[
                  styles.bar,
                  {
                    width: awayWidth,
                    backgroundColor: awayColor,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.bar,
                  {
                    width: awayWidth,
                    opacity: isTie || awayWins ? 1 : 0.4,
                    borderRadius: 6,
                    overflow: "hidden",
                  },
                ]}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <Pattern
                      id={`diagonalHatch-${key}`}
                      patternUnits="userSpaceOnUse"
                      width="6"
                      height="6"
                    >
                      <Path
                        d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
                        stroke={Colors.white}
                        strokeWidth={2}
                      />
                    </Pattern>
                  </Defs>

                  <Rect
                    width="100%"
                    height="100%"
                    fill={awayColor || Colors.black}
                  />

                  <Rect
                    width="100%"
                    height="100%"
                    fill={`url(#diagonalHatch-${key})`}
                  />
                </Svg>
              </View>
            )}
          </View>

          <View style={styles.barContainerRight}>
            <View
              style={[
                styles.bar,
                {
                  width: homeWidth,
                  backgroundColor: homeColor,
                  opacity: hidden || isTie || homeWins ? 1 : 0.4,
                  borderWidth: hidden ? 0 : 1,
                  borderColor: !hidden && isDark ? Colors.white : "transparent",
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.barText,
              !hidden && {
                opacity: isTie || homeWins ? 1 : 0.4,
              },
            ]}
          >
            {homeDisplayValue}
          </Text>
        </View>
      </View>
    );
  };

  if (!awayHasStats && !homeHasStats) {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {isScheduled ? "Team Stats" : "Game Stats"}
      </HeadingTwo>

      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image source={awayLogo} style={styles.logo} />
          <Text style={styles.teamLabel}>{awayCode}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={homeLogo} style={styles.logo} />
          <Text style={styles.teamLabel}>{homeCode}</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View
          pointerEvents="none"
          onLayout={(event) => {
            setFullHeight(event.nativeEvent.layout.height);
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: 0,
          }}
        >
          {STAT_KEYS.map((statConfig) => renderStatRow(statConfig, true))}
        </View>

        <Animated.View
          style={{
            maxHeight: heightAnim,
            overflow: "hidden",
          }}
        >
          {STAT_KEYS.map((statConfig) => renderStatRow(statConfig))}
        </Animated.View>

        <View style={styles.showMoreLessContainer}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              setExpanded((previous) => !previous);
            }}
          >
            <Text style={styles.showMoreLess}>
              {expanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
