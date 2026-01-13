import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getNFLTeamsLogo, getTeamInfo } from "constants/teamsNFL";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import HeadingTwo from "../../Headings/HeadingTwo";
const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

type NFLGameTeamStatsProps = {
  stats: any[] | null | undefined;
  lighter?: boolean;
};

// NFL-specific stat keys to display
const STAT_KEYS = [
  { key: "plays.total", label: "Total Plays" },
  { key: "first_downs.total", label: "First Downs" },
  { key: "first_downs.third_down_efficiency", label: "Third Down Efficiency" },
  {
    key: "first_downs.fourth_down_efficiency",
    label: "Fourth Down Efficiency",
  },
  { key: "passing.total", label: "Passing Yards" },
  { key: "passing.comp_att", label: "Passing CMP/ATT" },
  { key: "passing.yards_per_pass", label: "Passing Yards Per Pass" },
  { key: "passing.sacks_yards_lost", label: "Sacks Yards Lost" },
  { key: "rushings.total", label: "Rushing Yards" },
  { key: "yards.total", label: "Total Yards" },
  { key: "yards.yards_per_play", label: "Yards Per Play" },
  { key: "turnovers.total", label: "Turnovers" },
  { key: "penalties.total", label: "Penalties" },
  { key: "posession.total", label: "Time of Possession" },
  { key: "points_against.total", label: "Points Allowed" },
  { key: "sacks.total", label: "Sacks" },
];

// Safely get nested value from object like "passing.total"
const getValue = (obj: any, path: string) => {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export default function NFLGameTeamStats({
  stats,
  lighter = false,
}: NFLGameTeamStatsProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameTeamStatsStyles(isDark, lighter);
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT)
  ).current;

  // ✅ Safe: conditional rendering AFTER hooks
  if (!stats || stats.length < 2) {
    return null;
  }

  const teamA = stats[0];
  const teamB = stats[1];

  const getTeamColor = (teamId?: number) => {
    const team = getTeamInfo(teamId ?? 0);
    if (!team) return Colors.white;

    const primary = team.color ?? Colors.white;
    const secondary = team.secondaryColor ?? primary;

    if (isDark) {
      if (teamId === 19) return primary;

      // Existing overrides
      if (team.code === "BAL") return Colors.white;
      if (team.code === "ATL") return primary;
      if (team.code === "TB") return primary;
      if (team.code === "PHI") return Colors.white;

      // Default dark mode behavior
      return secondary;
    }

    // Light mode → always primary
    return primary;
  };

  const convertTimeToSeconds = (value: any) => {
    if (typeof value !== "string") return value;

    // Detect format MM:SS
    if (!/^\d{1,2}:\d{2}$/.test(value)) return value;

    const [min, sec] = value.split(":").map(Number);
    return min * 60 + sec;
  };

  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;
  const dividerColor = lighter
    ? Colors.white
    : isDark
    ? Colors.midTone
    : Colors.midTone;

  // Safe: optional chaining
  const teamNameA = getTeamInfo(teamA?.team?.id) ?? { code: "Home" };
  const teamNameB = getTeamInfo(teamB?.team?.id) ?? { code: "Away" };

  const teamALogo = getNFLTeamsLogo(teamA?.team.id, isDark);
  const teamBLogo = getNFLTeamsLogo(teamB?.team.id, isDark);

  // Pick team color, but override for Denver and Raiders

  const teamAColor = getTeamColor(teamA?.team?.id);
  const teamBColor = getTeamColor(teamB?.team?.id);
  const totalHeight = STAT_KEYS.length * (ROW_HEIGHT + 16); // add marginBottom
  const collapsedHeight = COLLAPSED_ROWS * (ROW_HEIGHT + 16);

  useEffect(() => {
    const toValue = expanded ? totalHeight : collapsedHeight;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <View>
      <HeadingTwo lighter={lighter}>Team Stats</HeadingTwo>

      {/* Logos Row */}
      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image source={teamBLogo} style={styles.logo} />

          <Text style={styles.teamLabel}>{teamNameB?.code ?? "Away"}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={teamALogo} style={styles.logo} />

          <Text style={styles.teamLabel}>{teamNameA?.code ?? "Home"}</Text>
        </View>
      </View>

      {/* Stats */}
      <ScrollView style={styles.container}>
        <Animated.View style={{ maxHeight: heightAnim, overflow: "hidden" }}>
          {STAT_KEYS.map(({ key, label }, index) => {
            const rawValueA = getValue(teamA?.statistics, key) ?? 0;
            const rawValueB = getValue(teamB?.statistics, key) ?? 0;

            // 👇 convert ONLY for bar math
            const valueA = convertTimeToSeconds(rawValueA) ?? 0;
            const valueB = convertTimeToSeconds(rawValueB) ?? 0;

            const max = Math.max(Math.abs(valueA), Math.abs(valueB), 1);

            const isTeamALower = valueA < valueB;
            const isTeamBLower = valueB < valueA;

            return (
              <View key={key} style={styles.statSection}>
                {/* ✅ NO divider directly under logo row */}
                {index !== 0 && <View style={styles.dividerLine} />}

                <Text style={styles.statLabel}>{label}</Text>

                <View style={styles.row}>
                  <Text style={styles.barText}>{rawValueB}</Text>

                  <View style={styles.barContainerLeft}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: teamBColor,
                          width: `${(Math.abs(valueB) / max) * 100}%`,
                          opacity: isTeamBLower ? 0.5 : 1,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.barContainerRight}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: teamAColor,
                          width: `${(Math.abs(valueA) / max) * 100}%`,
                          opacity: isTeamALower ? 0.5 : 1,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.barText}>{rawValueA}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Expand/Collapse */}
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={{
            paddingVertical: 12,
            justifyContent: "center",
            alignItems: "center",
            borderTopWidth: 1,
            borderColor: dividerColor,
          }}
        >
          <Text
            style={{
              color: textColor,
              fontFamily: Fonts.OSMEDIUM,
              fontSize: 14,
            }}
          >
            {expanded ? "Show Less" : "Show More"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const gameTeamStatsStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
    },
    logosRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
      alignItems: "center",
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
    teamContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    teamLabel: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    statSection: {
      marginBottom: 16,
      height: ROW_HEIGHT,
    },
    dividerLine: {
      height: 1,
      width: "100%",
      backgroundColor: lighter
        ? Colors.darkGray
        : isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    statLabel: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      marginTop: 8,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
    },
    barContainerLeft: {
      flex: 1,
      alignItems: "flex-start",
      marginLeft: 12,
    },
    barContainerRight: {
      flex: 1,
      alignItems: "flex-end",
      marginRight: 12,
    },
    bar: {
      height: 8,
      justifyContent: "center",
      borderRadius: 100,
    },
    barText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      textAlign: "center",
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    showMoreLess: {
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
    },
  });
