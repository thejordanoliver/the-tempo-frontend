// components/GameDetails/BoxScoreSkeleton.tsx
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const ROW_HEIGHT = 50;
const ROWS = 5;
const STAT_COLUMNS = 10; // visual approximation

type Props = {
  lighter?: boolean;
  teams?: number;
  showTeamHeader?: boolean; // ✅ NEW
};

export default function BoxScoreSkeleton({
  lighter = false,
  teams = 2,
  showTeamHeader = true, // ✅ default ON
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark, lighter);

  // Shared pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const Skeleton = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  const renderTeam = (key: string | number) => (
    <View key={key} style={styles.teamBox}>
      {/* Team header */}
      {showTeamHeader && (
        <View style={styles.teamHeader}>
          <Skeleton style={[styles.teamName]} />
          <Skeleton style={styles.teamLogo} />
        </View>
      )}

      {/* Table */}
      <View style={{ flexDirection: "row" }}>
        {/* Player names */}
        <View style={{ width: NAME_COLUMN_WIDTH }}>
          <View style={styles.headerRow}>
            <Skeleton style={styles.headerCellWide} />
          </View>

          {Array.from({ length: ROWS }).map((_, i) => (
            <View key={`name-${key}-${i}`} style={styles.row}>
              <Skeleton style={styles.playerName} />
            </View>
          ))}
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              {Array.from({ length: STAT_COLUMNS }).map((_, i) => (
                <Skeleton
                  key={`header-${key}-${i}`}
                  style={styles.headerCell}
                />
              ))}
            </View>

            {Array.from({ length: ROWS }).map((_, r) => (
              <View key={`row-${key}-${r}`} style={styles.row}>
                {Array.from({ length: STAT_COLUMNS }).map((_, c) => (
                  <Skeleton
                    key={`cell-${key}-${r}-${c}`}
                    style={styles.statCell}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {Array.from({ length: teams }).map((_, i) => (
        <View key={`team-skeleton-${i}`} style={{ marginBottom: 24 }}>
          {renderTeam(i)}
        </View>
      ))}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {},

    teamBox: {
      borderWidth: 1,
      borderRadius: 10,
      overflow: "hidden",
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
    },

    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    teamName: {
      width: 140,
      height: 18,
      borderRadius: 6,
      marginRight: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    teamLogo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
      paddingHorizontal: 6,
    },

    headerCellWide: {
      width: 80,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    headerCell: {
      width: COLUMN_WIDTH - 10,
      height: 12,
      marginHorizontal: 5,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    row: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
      paddingHorizontal: 6,
    },

    playerName: {
      width: NAME_COLUMN_WIDTH - 24,
      height: 14,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    statCell: {
      width: COLUMN_WIDTH - 10,
      height: 14,
      marginHorizontal: 5,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
