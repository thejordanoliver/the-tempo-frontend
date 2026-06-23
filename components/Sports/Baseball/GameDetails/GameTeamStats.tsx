import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { useEffect, useRef, useState } from "react";
import type { DimensionValue, ImageSourcePropType } from "react-native";
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

type MlbStatCategory = "batting" | "pitching" | "fielding";

type MlbStatConfig = {
  category: MlbStatCategory;
  key: string;
  label: string;
  lowerIsBetter?: boolean;
};

type MlbStatItem = {
  name?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  value?: number | string;
  displayValue?: string;
};

type MlbStatGroup = {
  name?: string;
  displayName?: string;
  stats?: MlbStatItem[];
};

type MlbTeamBoxscore = {
  homeAway?: "home" | "away" | string;
  displayOrder?: number;

  // ESPN payloads sometimes use `statistics`.
  statistics?: MlbStatGroup[];

  // Your logged data uses `stats`.
  stats?: MlbStatGroup[];

  team?: {
    id?: string;
    uid?: string;
    abbreviation?: string;
    displayName?: string;
    shortDisplayName?: string;
    location?: string;
    name?: string;
    slug?: string;
    color?: string;
    alternateColor?: string;
    logo?: string;
  };
};

type StatRow = {
  id: string;
  label: string;
  awayDisplay: string;
  homeDisplay: string;
  awayNum: number;
  homeNum: number;
  awayWins: boolean;
  homeWins: boolean;
  isTie: boolean;
  max: number;
};

const STAT_KEYS: MlbStatConfig[] = [
  // Batting
  {
    category: "batting",
    key: "runs",
    label: "Runs",
  },
  {
    category: "batting",
    key: "hits",
    label: "Hits",
  },
  {
    category: "batting",
    key: "homeRuns",
    label: "Home Runs",
  },
  {
    category: "batting",
    key: "RBIs",
    label: "RBI",
  },
  {
    category: "batting",
    key: "walks",
    label: "Walks",
  },
  {
    category: "batting",
    key: "strikeouts",
    label: "Batting K",
    lowerIsBetter: true,
  },
  {
    category: "batting",
    key: "stolenBases",
    label: "Stolen Bases",
  },
  {
    category: "batting",
    key: "runnersLeftOnBase",
    label: "Left On Base",
    lowerIsBetter: true,
  },
  {
    category: "batting",
    key: "avg",
    label: "AVG",
  },
  {
    category: "batting",
    key: "onBasePct",
    label: "OBP",
  },
  {
    category: "batting",
    key: "slugAvg",
    label: "SLG",
  },
  {
    category: "batting",
    key: "OPS",
    label: "OPS",
  },

  // Pitching
  {
    category: "pitching",
    key: "innings",
    label: "Innings Pitched",
  },
  {
    category: "pitching",
    key: "hits",
    label: "Hits Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "runs",
    label: "Runs Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "earnedRuns",
    label: "Earned Runs",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "walks",
    label: "Walks Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "strikeouts",
    label: "Pitching K",
  },
  {
    category: "pitching",
    key: "homeRuns",
    label: "HR Allowed",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "ERA",
    label: "ERA",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "WHIP",
    label: "WHIP",
    lowerIsBetter: true,
  },
  {
    category: "pitching",
    key: "pitches",
    label: "Pitches",
  },

  // Fielding
  {
    category: "fielding",
    key: "errors",
    label: "Errors",
    lowerIsBetter: true,
  },
  {
    category: "fielding",
    key: "doublePlays",
    label: "Double Plays",
  },
  {
    category: "fielding",
    key: "assists",
    label: "Assists",
  },
  {
    category: "fielding",
    key: "putouts",
    label: "Putouts",
  },
  {
    category: "fielding",
    key: "fieldingPct",
    label: "Fielding Pct",
  },
];

const normalizeColor = (color?: string, fallback = Colors.white) => {
  if (!color) return fallback;
  return color.startsWith("#") ? color : `#${color}`;
};

const getTeamStatGroups = (team?: MlbTeamBoxscore) => {
  if (Array.isArray(team?.statistics)) return team.statistics;
  if (Array.isArray(team?.stats)) return team.stats;
  return [];
};

const hasStatValue = (stat?: MlbStatItem) => {
  if (!stat) return false;

  if (stat.displayValue !== undefined && stat.displayValue !== "") {
    return true;
  }

  if (stat.value !== undefined && stat.value !== "") {
    return true;
  }

  return false;
};

const parseBaseballInnings = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return 0;

  const raw = String(value).trim();
  const [wholeRaw, partRaw] = raw.split(".");

  const whole = Number(wholeRaw) || 0;
  const part = Number(partRaw) || 0;

  if (!partRaw) return whole;
  if (part === 1) return whole + 1 / 3;
  if (part === 2) return whole + 2 / 3;

  return Number(raw) || 0;
};

const extractNumber = (value?: string | number, key?: string) => {
  if (value === undefined || value === null || value === "") return 0;

  if (key === "innings") {
    return parseBaseballInnings(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = value.replace("%", "").trim();

  if (cleaned.includes("-")) {
    const [first] = cleaned.split("-");
    return Number(first) || 0;
  }

  return Number(cleaned) || 0;
};

const getBarWidth = (value: number, max: number): DimensionValue => {
  const safeMax = Math.max(max, 1);
  const percentage = Math.max(0, Math.min((value / safeMax) * 100, 100));

  return `${percentage}%` as DimensionValue;
};

const getMlbStat = (
  team: MlbTeamBoxscore | undefined,
  category: MlbStatCategory,
  key: string,
) => {
  const groups = getTeamStatGroups(team);

  const group = groups.find(
    (item) => item.name?.toLowerCase() === category.toLowerCase(),
  );

  return group?.stats?.find((item) => item.name === key);
};

const buildRows = (
  away: MlbTeamBoxscore | undefined,
  home: MlbTeamBoxscore | undefined,
) => {
  return STAT_KEYS.map((config): StatRow | null => {
    const awayStat = getMlbStat(away, config.category, config.key);
    const homeStat = getMlbStat(home, config.category, config.key);

    const awayHasValue = hasStatValue(awayStat);
    const homeHasValue = hasStatValue(homeStat);

    if (!awayHasValue && !homeHasValue) return null;

    const awayDisplay =
      awayStat?.displayValue ?? String(awayStat?.value ?? "—");

    const homeDisplay =
      homeStat?.displayValue ?? String(homeStat?.value ?? "—");

    const awayRawValue = awayStat?.value ?? awayStat?.displayValue;
    const homeRawValue = homeStat?.value ?? homeStat?.displayValue;

    const awayNum = awayHasValue ? extractNumber(awayRawValue, config.key) : 0;
    const homeNum = homeHasValue ? extractNumber(homeRawValue, config.key) : 0;

    const max = Math.max(awayNum, homeNum, 1);
    const isTie = awayHasValue && homeHasValue && awayNum === homeNum;

    let awayWins = false;
    let homeWins = false;

    if (!isTie) {
      if (awayHasValue && !homeHasValue) {
        awayWins = true;
      } else if (!awayHasValue && homeHasValue) {
        homeWins = true;
      } else if (config.lowerIsBetter) {
        awayWins = awayNum < homeNum;
        homeWins = homeNum < awayNum;
      } else {
        awayWins = awayNum > homeNum;
        homeWins = homeNum > awayNum;
      }
    }

    return {
      id: `${config.category}-${config.key}`,
      label: config.label,
      awayDisplay: awayHasValue ? awayDisplay : "—",
      homeDisplay: homeHasValue ? homeDisplay : "—",
      awayNum,
      homeNum,
      awayWins,
      homeWins,
      isTie,
      max,
    };
  }).filter(Boolean) as StatRow[];
};

export default function GameTeamStats({
  stats,
  state,
  isDark,
  homeLogo,
  awayLogo,
  homeCode,
  awayCode,
  awayColor,
  homeColor,
}: {
  homeLogo?: ImageSourcePropType | null;
  awayLogo?: ImageSourcePropType | null;
  homeCode?: string | undefined;
  awayCode?: string | undefined;
  awayColor?: string;
  homeColor?: string;
  state: string | undefined;
  stats: MlbTeamBoxscore[] | undefined;
  isDark: boolean;
}) {
  const isScheduled = state === "pre";
  const styles = gameTeamStatsStyles(isDark);

  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  const heightAnim = useRef(
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT),
  ).current;

  const teams = Array.isArray(stats) ? stats : [];

  const away = teams.find((team) => team.homeAway === "away") ?? teams[0];
  const home = teams.find((team) => team.homeAway === "home") ?? teams[1];

  const rows = !isScheduled && away && home ? buildRows(away, home) : [];

  const canExpand = rows.length > COLLAPSED_ROWS;

  const collapsedHeight =
    Math.min(rows.length || COLLAPSED_ROWS, COLLAPSED_ROWS) * ROW_HEIGHT;

  const awayTeamColor = isDark
    ? Colors.white
    : normalizeColor(awayColor ?? away?.team?.color, Colors.white);

  const homeTeamColor = normalizeColor(
    homeColor ?? home?.team?.color,
    Colors.white,
  );

  const awayTeamCode = awayCode ?? away?.team?.abbreviation ?? "";
  const homeTeamCode = homeCode ?? home?.team?.abbreviation ?? "";

  useEffect(() => {
    const toValue = expanded ? fullHeight : collapsedHeight;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [collapsedHeight, expanded, fullHeight, heightAnim]);

  if (isScheduled) return null;
  if (teams.length < 2) return null;
  if (!away || !home) return null;
  if (rows.length === 0) return null;

  const renderStatRow = (
    row: StatRow,
    index: number,
    renderKey: "measure" | "visible",
  ) => {
    const awayOpacity = row.isTie || row.awayWins ? 1 : 0.4;
    const homeOpacity = row.isTie || row.homeWins ? 1 : 0.4;

    const awayWidth = getBarWidth(row.awayNum, row.max);
    const homeWidth = getBarWidth(row.homeNum, row.max);

    const patternId = `diagonalHatch-${renderKey}-${row.id}-${index}`;

    return (
      <View key={`${renderKey}-${row.id}`} style={styles.statSection}>
        <Text style={styles.statLabel}>{row.label}</Text>

        <View style={styles.row}>
          <Text style={[styles.barText, { opacity: awayOpacity }]}>
            {row.awayDisplay}
          </Text>

          <View style={styles.barContainerLeft}>
            <View
              style={[
                styles.bar,
                {
                  width: awayWidth,
                  opacity: awayOpacity,
                  borderRadius: 6,
                  overflow: "hidden",
                },
              ]}
            >
              <Svg width="100%" height="100%">
                <Defs>
                  <Pattern
                    id={patternId}
                    patternUnits="userSpaceOnUse"
                    width="6"
                    height="6"
                  >
                    <Path
                      d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
                      stroke={awayTeamColor}
                      strokeWidth={2}
                    />
                  </Pattern>
                </Defs>

                <Rect
                  width="100%"
                  height="100%"
                  fill={isDark ? Colors.black : Colors.white}
                />

                <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
              </Svg>
            </View>
          </View>

          <View style={styles.barContainerRight}>
            <View
              style={[
                styles.bar,
                {
                  width: homeWidth,
                  backgroundColor: homeTeamColor,
                  borderWidth: 1,
                  borderColor: isDark ? Colors.white : "transparent",
                  opacity: homeOpacity,
                },
              ]}
            />
          </View>

          <Text style={[styles.barText, { opacity: homeOpacity }]}>
            {row.homeDisplay}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <HeadingTwo isDark={isDark}>Team Stats</HeadingTwo>

      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          {awayLogo ? <Image source={awayLogo} style={styles.logo} /> : null}

          <Text style={styles.teamLabel}>{awayTeamCode}</Text>
        </View>

        <View style={styles.teamContainer}>
          {homeLogo ? <Image source={homeLogo} style={styles.logo} /> : null}

          <Text style={styles.teamLabel}>{homeTeamCode}</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: 0,
          }}
          onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
        >
          {rows.map((row, index) => renderStatRow(row, index, "measure"))}
        </View>

        <Animated.View style={{ maxHeight: heightAnim, overflow: "hidden" }}>
          {rows.map((row, index) => renderStatRow(row, index, "visible"))}
        </Animated.View>

        {canExpand ? (
          <View style={styles.showMoreLessContainer}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => setExpanded((prev) => !prev)}
            >
              <Text style={styles.showMoreLess}>
                {expanded ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
