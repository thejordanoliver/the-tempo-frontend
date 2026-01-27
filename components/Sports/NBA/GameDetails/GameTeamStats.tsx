import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/Styles";
import { teamsById } from "constants/teams";
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

const COLLAPSED_ROWS = 5;
const ROW_HEIGHT = 64;

const STAT_KEYS = [
  { key: "assists", label: "Assists" },
  { key: "totReb", label: "Rebounds" },
  { key: "offReb", label: "Offensive Rebounds" },
  { key: "defReb", label: "Defensive Rebounds" },
  { key: "steals", label: "Steals" },
  { key: "blocks", label: "Blocks" },
  { key: "turnovers", label: "Turnovers" },
  { key: "biggestLead", label: "Biggest Lead" },
  { key: "pointsInPaint", label: "Points in Paint" },
  { key: "secondChancePoints", label: "Second Chance Points" },
  { key: "longestRun", label: "Longest Run" },
  { key: "pFouls", label: "Personal Fouls" },
  { key: "fgm", label: "Field Goals Made" },
  { key: "fga", label: "Field Goals Attempted" },
  { key: "fgp", label: "Field Goals Percentage" },
  { key: "ftm", label: "Free Throws Made" },
  { key: "fta", label: "Free Throws Attempted" },
  { key: "ftp", label: "Free Throws Percentage" },
  { key: "tpm", label: "Three Points Made" },
  { key: "tpa", label: "Three Points Attempted" },
  { key: "plusMinus", label: "Plus/Minus" },
];

export default function GameTeamStats({
  stats,
  lighter = false,
}: {
  stats: any[];
  lighter?: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  const styles = gameTeamStatsStyles(isDark, lighter);
  // 🔥 Early returns BEFORE any useState / useRef / useEffect
  if (!stats || stats.length < 2) return null;

  const teamA = stats[0];
  const teamB = stats[1];
  const statA = teamA.statistics?.[0];
  const statB = teamB.statistics?.[0];

  if (!statA || !statB) return null;

  // ✅ SAFE: All hooks after this point
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(
    new Animated.Value(COLLAPSED_ROWS * ROW_HEIGHT)
  ).current;

  useEffect(() => {
    const toValue = expanded
      ? STAT_KEYS.length * ROW_HEIGHT
      : COLLAPSED_ROWS * ROW_HEIGHT;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  if (!statA || !statB) return null;

  const teamDataA = teamsById[teamA.team.id];
  const teamDataB = teamsById[teamB.team.id];

  return (
    <View>
      <HeadingTwo lighter={lighter}>Game Stats</HeadingTwo>
      <View style={styles.logosRow}>
        <View style={styles.teamContainer}>
          <Image
            source={
              isDark ? teamDataB.logoLight || teamDataB.logo : teamDataB.logo
            }
            style={styles.logo}
          />
          <Text style={styles.teamLabel}>{teamDataB.code}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image
            source={
              isDark ? teamDataA.logoLight || teamDataA.logo : teamDataA.logo
            }
            style={styles.logo}
          />
          <Text style={styles.teamLabel}>{teamDataA.code}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <Animated.View style={{ maxHeight: heightAnim, overflow: "hidden" }}>
          {STAT_KEYS.map(({ key, label }, index) => {
            const rawValueA = statA[key];
            const rawValueB = statB[key];
            if (rawValueA == null && rawValueB == null) return null;

            const valueA = rawValueA ?? 0;
            const valueB = rawValueB ?? 0;
            const max = Math.max(Math.abs(valueA), Math.abs(valueB), 1);
            const isTeamALower = valueA < valueB;
            const isTeamBLower = valueB < valueA;

            return (
              <View key={key} style={styles.statSection}>
                {/* ✅ Skip divider for first row */}
                {index !== 0 && <View style={styles.dividerLine} />}

                <Text style={styles.statLabel}>{label}</Text>

                <View style={styles.row}>
                  <Text style={styles.barText}>
                    {["fgp", "ftp", "tpp"].includes(key)
                      ? `${valueB}%`
                      : valueB}
                  </Text>

                  <View style={styles.barContainerLeft}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: isDark ? Colors.white : Colors.black,
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
                          backgroundColor: isDark ? Colors.white : Colors.black,
                          width: `${(Math.abs(valueA) / max) * 100}%`,
                          opacity: isTeamALower ? 0.5 : 1,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.barText}>
                    {["fgp", "ftp", "tpp"].includes(key)
                      ? `${valueA}%`
                      : valueA}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={{
            paddingVertical: 12,
            justifyContent: "center",
            alignItems: "center",
            borderColor: Colors.midTone,
            borderTopWidth: 1,
          }}
        >
          <Text style={styles.showMoreLess}>
            {expanded ? "Show Less" : "Show More"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export const gameTeamStatsStyles = (isDark: boolean, lighter: boolean) =>
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
