import {
  getSportsCardGradient,
  sportsCardBackgroundStyles,
} from "styles/SportsCardBackgroundStyles";
// components/CFB/TeamRankCard.tsx
import { getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { RecruitTeamRanking } from "@/hooks/RecruitHooks/useTeamRecruitingRankings";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  item: RecruitTeamRanking;
  league: "mcbb" | "cfb";
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

export default function TeamRankCard({ item, index, league }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const [slideX] = useState(() => new Animated.Value(70));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay: Math.min(index, 8) * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay: Math.min(index, 8) * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, index, slideX]);

  const teamId = item.team_id ?? 0;
  const logo =
    league === "cfb"
      ? getCFBTeamLogo(teamId, isDark)
      : league === "mcbb"
        ? getMCBBTeamLogo(teamId, isDark)
        : null;

  const rankChange =
    item.previous_rank && item.rank ? item.previous_rank - item.rank : 0;

  const movedUp = rankChange > 0;
  const movedDown = rankChange < 0;

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
          <Image
            source={logo}
            style={styles.backgroundLogo}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <LinearGradient
        {...getSportsCardGradient(isDark)}
        style={styles.cardGradient}
      />

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text style={styles.rank}>#{item.rank}</Text>
          <View style={styles.teamBlock}>
            <Text numberOfLines={1} style={styles.teamName}>
              {item.team_name}
            </Text>

            <Text style={styles.points}>
              {formatDecimal(item.points)} points
            </Text>
          </View>
          {(movedUp || movedDown) && (
            <View
              style={[
                styles.rankChangePill,
                movedUp ? styles.rankChangePillUp : styles.rankChangePillDown,
              ]}
            >
              <Ionicons
                name={movedUp ? "arrow-up" : "arrow-down"}
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
                  movedUp ? styles.rankChangeTextUp : styles.rankChangeTextDown,
                ]}
              />
              <Text
                style={[
                  styles.rankChangeText,
                  movedUp ? styles.rankChangeTextUp : styles.rankChangeTextDown,
                ]}
              >
                {movedUp ? "Up" : "Down"} {Math.abs(rankChange)}
              </Text>
            </View>
          )}
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

const getStyles = (isDark: boolean) => {
  const bgColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  return StyleSheet.create({
    cardWrapper: {
      position: "relative",
      minHeight: 116,
      marginHorizontal: 12,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: bgColor,
      overflow: "hidden",
    },

    logoContainer: sportsCardBackgroundStyles.logoContainer,
    backgroundLogo: sportsCardBackgroundStyles.backgroundLogo,
    cardGradient: sportsCardBackgroundStyles.cardGradient,

    cardContent: {
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    rank: {
      fontFamily: Fonts.BOLD,
      fontSize: 30,
      lineHeight: 34,
      color: isDark ? Colors.white : Colors.black,
    },

    rankChangePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: bgColor,
    },

    rankChangePillUp: {
      backgroundColor: "rgba(34,197,94,0.14)",
    },

    rankChangePillDown: {
      backgroundColor: "rgba(239,68,68,0.14)",
    },

    rankChangeText: {
      fontFamily: Fonts.BOLD,
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
      flex: 1,
      minWidth: 0,
    },

    teamName: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      lineHeight: 26,
      color: isDark ? Colors.white : Colors.black,
    },

    points: {
      marginTop: 3,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? Colors.dark.transparentGray
        : Colors.light.transparentGray,
    },

    statItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    statLabelWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 2,
    },

    statValue: {
      fontFamily: Fonts.SPORTS_SEMIBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    statLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 26,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
};
