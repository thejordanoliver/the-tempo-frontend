// components/GameDetails/AwardSeasonTableSkeleton.tsx
import { Colors } from "constants/styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const COLUMN_WIDTH = 70;
const NAME_COLUMN_WIDTH = "100%";
const ROW_HEIGHT = 50;
const ROWS = 5;

type Props = {
  lighter?: boolean;
  teams?: number;
  showTeamHeader?: boolean;
};

export default function AwardSeasonTableSkeleton({
  lighter = false,
  teams = 1,
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
      ]),
    ).start();
  }, [pulseAnim]);

  const Skeleton = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  const rowsArray = Array.from({ length: ROWS });

  const getRowStyle = (index: number) => [
    styles.row,

    // ✅ alternating stripes
    index % 2 === 1 && {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    // ✅ remove border from last row
    index === rowsArray.length - 1 && {
      borderBottomWidth: 0,
    },
  ];

  const renderTeam = (key: number) => (
    <View key={key} style={styles.teamBox}>
      {/* Table */}
      <View style={{ flexDirection: "row" }}>
        {/* Player names */}
        <View style={{ width: NAME_COLUMN_WIDTH }}>
          <View style={styles.headerRow}>
            <Skeleton style={styles.headerCellWide} />
          </View>

          {rowsArray.map((_, i) => (
            <View key={`name-${key}-${i}`} style={getRowStyle(i)}>
              <Skeleton style={styles.playerName} />
              <Skeleton style={styles.playerTeam} />
            </View>
          ))}
        </View>
      </View>

      {/* Full-width button */}
      <View style={styles.button}>
        <Skeleton style={styles.buttonSkeleton} />
      </View>
    </View>
  );

  return (
    <ScrollView>
      {Array.from({ length: teams }).map((_, i) => (
        <View key={`team-skeleton-${i}`}>{renderTeam(i)}</View>
      ))}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    teamBox: {
      borderRadius: 10,
      overflow: "hidden",
      borderColor: Colors.midTone,
      borderWidth: 1,
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
      width: COLUMN_WIDTH - 20,
      height: 12,
      marginHorizontal: 5,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    row: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
      paddingHorizontal: 6,
    },

    button: {
      height: ROW_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },

    buttonSkeleton: {
      width: "20%",
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    playerName: {
      width: 120,
      height: 14,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    playerTeam: {
      width: 60,
      height: 14,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    statCell: {
      width: COLUMN_WIDTH - 20,
      height: 14,
      marginHorizontal: 5,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
