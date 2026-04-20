import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

const ROWS = 16;
const ROW_HEIGHT = 60;
const RANK_WIDTH = 20;

export const StandingsSkeleton = () => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const bg = isDark ? Colors.dark.itemBackground : Colors.light.itemBackground;

  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, []);

  const StatBar = () => (
    <Animated.View
      style={[styles.statBar, { backgroundColor: bg, opacity: pulse }]}
    />
  );

  const ConferenceHeader = () => (
    <Animated.View
      style={[
        styles.conferenceHeader,
        {
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          opacity: pulse,
        },
      ]}
    >
      <View style={[styles.conferenceBar, { backgroundColor: bg }]} />
    </Animated.View>
  );

  const TeamColumnRow = ({ index }: { index: number }) => {
    const isLastRow = index === ROWS - 1;

    return (
      <Animated.View
        style={[
          styles.teamRow,
          {
            borderBottomWidth: isLastRow ? 0 : 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
            opacity: pulse,
          },
        ]}
      >
        <Animated.View style={[styles.rankBox, { backgroundColor: bg }]} />

        <View style={styles.teamInfo}>
          <Animated.View style={[styles.teamLogo, { backgroundColor: bg }]} />
          <Animated.View style={[styles.teamName, { backgroundColor: bg }]} />
        </View>
      </Animated.View>
    );
  };

  const TeamColumnHeader = () => (
    <Animated.View
      style={[
        styles.teamHeader,
        {
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          opacity: pulse,
        },
      ]}
    >
      <Animated.View style={[styles.rankBox, { backgroundColor: bg }]} />
      <Animated.View style={[styles.teamHeaderText, { backgroundColor: bg }]} />
    </Animated.View>
  );

  const StatRow = ({ index }: { index: number }) => {
    const isLastRow = index === ROWS - 1;

    return (
      <Animated.View
        style={[
          styles.statRow,
          {
            borderBottomWidth: isLastRow ? 0 : 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
            opacity: pulse,
          },
        ]}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <View key={n} style={styles.statItem}>
            <StatBar />
          </View>
        ))}
      </Animated.View>
    );
  };

  const StatHeader = () => (
    <Animated.View
      style={[
        styles.statHeader,
        {
          borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          opacity: pulse,
        },
      ]}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={styles.statItem}>
          <StatBar />
        </View>
      ))}
    </Animated.View>
  );

  const TableSkeleton = () => (
    <View
      style={[
        styles.tableWrapper,
        {
          borderColor: isDark ? Colors.darkGray : Colors.midTone,
        },
      ]}
    >
      {/* Conference Header INSIDE wrapper */}
      <ConferenceHeader />

      <View style={styles.tableRow}>
        <View style={styles.teamColumn}>
          <TeamColumnHeader />
          {Array.from({ length: ROWS }).map((_, i) => (
            <TeamColumnRow key={i} index={i} />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <StatHeader />
            {Array.from({ length: ROWS }).map((_, i) => (
              <StatRow key={i} index={i} />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.filterRow, { opacity: pulse }]}>
        <View style={[styles.filterLarge, { backgroundColor: bg }]} />
        <View style={[styles.filterSmall, { backgroundColor: bg }]} />
      </Animated.View>

      <TableSkeleton />
      <TableSkeleton />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12 },

  content: {
    paddingBottom: 100,
  },

  filterRow: {
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },

  filterLarge: {
    width: 120,
    height: 32,
    borderRadius: 8,
  },

  filterSmall: {
    width: 100,
    height: 32,
    borderRadius: 8,
  },

  tableWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },

  conferenceHeader: {
    padding: 12,
    justifyContent: "center",
    borderBottomWidth: 1,
  },

  conferenceBar: {
    width: 180,
    height: 20,
    borderRadius: 4,
  },

  tableRow: {
    flexDirection: "row",
  },

  teamColumn: {
    width: 180,
  },

  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingHorizontal: 12,
  },

  rankBox: {
    width: RANK_WIDTH,
    height: RANK_WIDTH,
    borderRadius: 4,
  },

  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  teamLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  teamName: {
    width: 60,
    height: 14,
    marginLeft: 8,
    borderRadius: 4,
  },

  teamHeaderText: {
    width: 60,
    height: 14,
    marginLeft: 12,
    borderRadius: 4,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    paddingLeft: 16,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingLeft: 16,
  },

  statItem: {
    marginRight: 20,
  },

  statBar: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
});
