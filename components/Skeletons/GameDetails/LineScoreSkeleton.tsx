import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
import HeaderSkeleton from "../HeaderSkeleton";

type Props = {
  league: "MLB" | "NBA" | "CBB" | "WCBB" | "CFB" | "NFL" | "NHL";
};

export default function LineScoreSkeleton({ league }: Props) {
  const isDark = useColorScheme() === "dark";
  const baseColor = isDark ? Colors.darkGray : Colors.lightGray;

  // Pulse animation
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  // Correct periods by league
  const PERIOD_MAP: Record<Props["league"], number> = {
    MLB: 9,
    NBA: 4,
    WCBB: 4,
    CBB: 2,
    CFB: 4,
    NFL: 4,
    NHL: 3,
  };

  const periods = PERIOD_MAP[league] ?? 4;
  const columnsArray = Array.from({ length: periods + 1 }); // + total column

  const borderPulse = pulse.interpolate({
    inputRange: [0.4, 1],
    outputRange: ["rgba(150,150,150,0.3)", "rgba(150,150,150,0.8)"],
  });

  const Placeholder = () => (
    <Animated.View
      style={[styles.bar, { backgroundColor: baseColor, opacity: pulse }]}
    />
  );

  // ---------------------------------------------
  // Header Row (Periods/Innings)
  // ---------------------------------------------
  const HeaderRow = () => (
    <View style={styles.headerRow}>
      <View style={[styles.teamCode, { opacity: 0 }]} />
      <View style={styles.scoresWrapper}>
        {columnsArray.map((_, i) => (
          <Placeholder key={`header-${i}`} />
        ))}
      </View>
    </View>
  );

  const TeamRow = ({ keyPrefix }: { keyPrefix: string }) => (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.teamCode,
          { backgroundColor: baseColor, opacity: pulse },
        ]}
      />
      <View style={styles.scoresWrapper}>
        {columnsArray.map((_, i) => (
          <Placeholder key={`${keyPrefix}-${i}`} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title skeleton */}
      <HeaderSkeleton />

      {/* Line score box */}
      <Animated.View style={[styles.wrapper, { borderColor: borderPulse }]}>
        <HeaderRow />

        <TeamRow keyPrefix="away" />

        <Animated.View
          style={[
            styles.divider,
            { backgroundColor: baseColor, opacity: pulse },
          ]}
        />

        <TeamRow keyPrefix="home" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 6,
  },

  wrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    padding: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  teamCode: {
    width: 48,
    height: 14,
    borderRadius: 4,
    paddingLeft: 8,
  },

  scoresWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  bar: {
    width: 16,
    height: 12,
    borderRadius: 3,
  },

  divider: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
});
