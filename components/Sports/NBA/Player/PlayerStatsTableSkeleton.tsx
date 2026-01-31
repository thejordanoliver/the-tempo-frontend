import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import { Colors } from "constants/Colors";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const STAT_COLUMNS = 22;
const CELL_WIDTH = 30;
const CELL_HEIGHT = 10;
const CELL_MARGIN = 8;
const ROW_HEIGHT = 36;

export default function PlayerStatTableSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Pulse animation for ALL cells
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.container}>
      <HeaderSkeleton style={{ marginHorizontal: 0 }} />
      {/* ---------------- Fixed 1st Column + Scrollable Block ---------------- */}
      <View style={styles.tableWrapper}>
        {/* FIXED COLUMN BLOCK */}
        <View style={styles.fixedColumn}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.fixedRowWrapper,
                i % 2 === 0 ? styles.altRow : null, // ✅ full-row alternating background
              ]}
            >
              <Animated.View
                style={[styles.fixedCell, { opacity: pulseAnim }]}
              />
            </View>
          ))}
        </View>

        {/* SCROLLABLE COLUMNS (2→22) */}
        <ScrollView
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
        >
          <View>
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.scrollRow,
                  i % 2 === 0 ? styles.altRow : null, // alternating row colors
                ]}
              >
                {Array.from({ length: STAT_COLUMNS - 1 }).map((_, colIndex) => (
                  <Animated.View
                    key={colIndex}
                    style={[styles.cell, { opacity: pulseAnim }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      overflow: "hidden",
      borderRadius: 8,
    },

    tableWrapper: {
      flexDirection: "row",
      width: "100%",
      borderRadius: 8,
      overflow: "hidden", // 🔑 REQUIRED for clipping rows
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    /* ---------- FIXED LEFT COLUMN ---------- */
    fixedColumn: {
      width: 60,
    },

    fixedRowWrapper: {
      height: ROW_HEIGHT, // must match scrollRow height
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      overflow: "hidden",
    },

    fixedCell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      borderRadius: 6,
      marginHorizontal: CELL_MARGIN,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    /* ---------- SCROLLABLE COLUMNS ---------- */
    scrollRow: {
      flexDirection: "row",
      alignItems: "center",
      height: ROW_HEIGHT,
      paddingVertical: 4,
      paddingLeft: 36,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    cell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      borderRadius: 6,
      marginHorizontal: CELL_MARGIN,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    /* ---------- Alternating background ---------- */
    altRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
  });
