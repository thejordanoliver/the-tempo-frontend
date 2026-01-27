import HeaderSkeleton from "components/Headings/HeaderSkeleton";
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

/* -------------------------------------------------- */
/* Shared layout constants                            */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* Shared layout constants                            */
/* -------------------------------------------------- */

const LOGO_SIZE = 28;
const TEAM_NAME_WIDTH = 40;
const TEAM_INFO_GAP = 4;

const TEAM_INFO_WIDTH = LOGO_SIZE + TEAM_INFO_GAP + TEAM_NAME_WIDTH + 8;

// Adjust spacing here for more horizontal space
const ODDS_FLEX = 0.3;
const FIRST_ODDS_MARGIN = 80; // smaller than 200
const OTHER_ODDS_MARGIN = 40;  // smaller than 16



/* -------------------------------------------------- */
/* Reusable Pulse Block                               */
/* -------------------------------------------------- */

const Pulse = ({ style, color }: { style?: any; color: string }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[style, { backgroundColor: color, opacity }]} />;
};

/* -------------------------------------------------- */
/* Odds Skeleton                                      */
/* -------------------------------------------------- */

export const OddsSkeleton = () => {
  const isDark = useColorScheme() === "dark";
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <View>
      {/* Section Header */}
      <HeaderSkeleton
        style={{
          marginLeft: 0,
          paddingBottom: 4,
          marginBottom: 12,
          borderBottomColor: Colors.midTone,
          borderBottomWidth: 1,
          marginHorizontal: 0,
        }}
      />
      <View style={styles.wrapper}>
        {/* Column Header Row */}
        <View style={styles.headerRow}>
          {/* Team column header */}
          <Pulse
            style={[styles.headerCell, { width: TEAM_INFO_WIDTH }]}
            color={skeletonColor}
          />

          {/* Odds column headers (MATCH ROW LAYOUT EXACTLY) */}
          {[...Array(3)].map((_, i) => (
            <Pulse
              key={`header-${i}`}
              style={[
                styles.headerCell,
                {
                  flex: ODDS_FLEX,
                  marginLeft: i === 0 ? FIRST_ODDS_MARGIN : OTHER_ODDS_MARGIN,
                },
              ]}
              color={skeletonColor}
            />
          ))}
        </View>

        {/* Away Team Row */}
        <View style={styles.teamRow}>
          <View style={[styles.teamInfo, { width: TEAM_INFO_WIDTH }]}>
            <Pulse style={styles.logoSkeleton} color={skeletonColor} />
            <Pulse style={styles.teamNameSkeleton} color={skeletonColor} />
          </View>

          {[...Array(3)].map((_, i) => (
            <Pulse
              key={`away-odd-${i}`}
              style={[
                styles.oddsCell,
                {
                  flex: ODDS_FLEX,
                  marginLeft: i === 0 ? FIRST_ODDS_MARGIN : OTHER_ODDS_MARGIN,
                },
              ]}
              color={skeletonColor}
            />
          ))}
        </View>

        {/* Divider */}
        <View
          style={{
            borderBottomColor: Colors.midTone,
            borderBottomWidth: 1,
            marginVertical: 8,
          }}
        />

        {/* Home Team Row */}
        <View style={styles.teamRow}>
          <View style={[styles.teamInfo, { width: TEAM_INFO_WIDTH }]}>
            <Pulse style={styles.logoSkeleton} color={skeletonColor} />
            <Pulse style={styles.teamNameSkeleton} color={skeletonColor} />
          </View>

          {[...Array(3)].map((_, i) => (
            <Pulse
              key={`home-odd-${i}`}
              style={[
                styles.oddsCell,
                {
                  flex: ODDS_FLEX,
                  marginLeft: i === 0 ? FIRST_ODDS_MARGIN : OTHER_ODDS_MARGIN,
                },
              ]}
              color={skeletonColor}
            />
          ))}
        </View>
        {/* Bookmaker Info */}
        <View style={styles.bookmaker}>
          <Pulse style={styles.subtext} color={skeletonColor} />

          <Pulse style={styles.date} color={skeletonColor} />
        </View>
      </View>
    </View>
  );
};

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 10,
  },
  wrapper: {
    borderColor: Colors.midTone,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  headerCell: {
    height: 12,
    borderRadius: 6,

  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
   
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: TEAM_INFO_GAP,
    
  },
  logoSkeleton: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 6,
  },
  teamNameSkeleton: {
    width: TEAM_NAME_WIDTH,
    height: 16,
    borderRadius: 6,
    marginLeft: TEAM_INFO_GAP,
  },
  subtext: {
    width: 40,
    height: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  date: {
    width: 60,
    height: 8,
    borderRadius: 6,
  },
  oddsCell: {
    height: 16,
    borderRadius: 6,
  },
  bookmaker: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
});

export default OddsSkeleton;
