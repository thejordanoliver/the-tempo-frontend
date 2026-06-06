// components/CFB/TeamRankCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { CFBRecruitTeamRanking } from "hooks/FootballHooks/useCFBTeamRecruitingRankings";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  item: CFBRecruitTeamRanking;
  index: number;
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDecimal(value: string | number | null | undefined, digits = 2) {
  const parsed = toNumber(value);
  return parsed === null ? "—" : parsed.toFixed(digits);
}

export default function TeamRankCard({ item, index }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const slideX = useRef(new Animated.Value(70)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, index, slideX]);

  const teamId = item.team_id ?? null;
  const team = teamId ? getCFBTeam(Number(teamId)) : null;
  const logoId = team?.id ?? teamId;
  const logo = logoId ? getCFBTeamLogo(logoId, isDark) : null;

  const rankChange =
    item.previous_rank && item.rank ? item.previous_rank - item.rank : 0;

  const movedUp = rankChange > 0;
  const movedDown = rankChange < 0;

  const rankChangeLabel =
    rankChange === 0
      ? "No change"
      : movedUp
        ? `Up ${Math.abs(rankChange)}`
        : `Down ${Math.abs(rankChange)}`;

  return (
    <View style={styles.cardWrapper}>
      {logo && (
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fade,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <Image source={logo} style={styles.backgroundLogo} />
        </Animated.View>
      )}

      <LinearGradient
        colors={
          isDark
            ? [
                "rgba(29,29,29,0.96)",
                "rgba(29,29,29,1)",
                "rgba(29,29,29,0.92)",
                "rgba(29,29,29,0.62)",
                "rgba(29,29,29,0.22)",
                "rgba(0,0,0,0)",
              ]
            : [
                "rgba(255,255,255,0.96)",
                "rgba(255,255,255,1)",
                "rgba(255,255,255,0.92)",
                "rgba(255,255,255,0.62)",
                "rgba(255,255,255,0.22)",
                "rgba(255,255,255,0)",
              ]
        }
        locations={[0, 0.35, 0.58, 0.74, 0.88, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}
      />

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.rankBlock}>
            <Text style={styles.rank}>#{item.rank}</Text>

            <View
              style={[
                styles.rankChangePill,
                movedUp && styles.rankChangePillUp,
                movedDown && styles.rankChangePillDown,
              ]}
            >
              <Ionicons
                name={
                  rankChange === 0
                    ? "remove"
                    : movedUp
                      ? "arrow-up"
                      : "arrow-down"
                }
                size={10}
                color={
                  movedUp
                    ? isDark
                      ? Colors.dark.leafGreen
                      : Colors.light.green
                    : isDark
                      ? Colors.dark.lightRed
                      : Colors.light.red
                }
                style={[
                  styles.rankChangeText,
                  movedUp && styles.rankChangeTextUp,
                  movedDown && styles.rankChangeTextDown,
                ]}
              />
              <Text
                style={[
                  styles.rankChangeText,
                  movedUp && styles.rankChangeTextUp,
                  movedDown && styles.rankChangeTextDown,
                ]}
              >
                {rankChangeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.teamBlock}>
            <Text numberOfLines={1} style={styles.teamName}>
              {item.team_name}
            </Text>

            <Text style={styles.points}>
              {formatDecimal(item.points)} points
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.total_commits}</Text>
            <Text style={styles.statLabel}>Commits</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.five_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>5</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.four_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>4</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.three_stars}</Text>
            <View style={styles.statLabelWrapper}>
              <Text style={styles.statLabel}>3</Text>
              <Ionicons
                name={"star"}
                size={10}
                color={isDark ? Colors.dark.yellow : Colors.light.yellow}
              />
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDecimal(item.average_rating)}
            </Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      overflow: "hidden",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      position: "relative",
      minHeight: 116,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    logoContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "48%",
      justifyContent: "center",
      alignItems: "flex-end",
      overflow: "hidden",
    },

    backgroundLogo: {
      height: "210%",
      aspectRatio: 1,
      opacity: isDark ? 0.5 : 0.38,
      marginRight: -42,
    },

    cardGradient: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "122%",
    },

    cardContent: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 12,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    rankBlock: {
      width: 76,
      gap: 5,
    },

    rank: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 30,
      lineHeight: 34,
      color: isDark ? Colors.white : Colors.black,
    },

    rankChangePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },

    rankChangePillUp: {
      backgroundColor: "rgba(34,197,94,0.14)",
    },

    rankChangePillDown: {
      backgroundColor: "rgba(239,68,68,0.14)",
    },

    rankChangeText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    rankChangeTextUp: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },

    rankChangeTextDown: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    teamBlock: {
      minWidth: 0,
    },

    teamName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 25,
      lineHeight: 30,
      color: isDark ? Colors.white : Colors.black,
    },

    points: {
      marginTop: 3,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 15,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.045)",
      gap: 10,
    },

    statItem: {
      alignItems: "center",
      minWidth: 34,
    },

    statLabelWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 2,
    },

    statValue: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },

    statLabel: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 26,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
