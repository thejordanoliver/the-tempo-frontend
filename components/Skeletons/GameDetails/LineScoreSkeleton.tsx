import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

type Props = {
  league: "MLB" | "NBA" | "CBB" | "WCBB" | "CFB" | "NFL" | "NHL";
};

export default function LineScoreSkeleton({ league }: Props) {
  const isDark = useColorScheme() === "dark";
  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

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

  // MLB = 10 innings + total
  // Others = 5 periods + total
  const isMLB = league === "MLB";
  const periods = isMLB ? 10 : 5;
  const columnsArray = Array.from({ length: periods + 1 }); // includes total

  const Placeholder = () => (
    <Animated.View
      style={[styles.bar, { backgroundColor: baseColor, opacity: pulse }]}
    />
  );

  // ---------------------------------------------
  // 🟦 Header Row (Periods/Innings)
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
      {/* Header separator */}
      <Animated.View
        style={[styles.heading, { backgroundColor: baseColor, opacity: pulse }]}
      />
      <Animated.View
        style={[
          styles.headingBar,
          { backgroundColor: baseColor, opacity: pulse },
        ]}
      />

      {/* Header periods/innings */}
      <HeaderRow />

      {/* Away */}
      <TeamRow keyPrefix="away" />

      {/* Divider */}
      <Animated.View
        style={[styles.divider, { backgroundColor: baseColor, opacity: pulse }]}
      />

      {/* Home */}
      <TeamRow keyPrefix="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 6,
  },

  heading: {
    height: 25,
    width: 150,
    borderRadius: 3,
    marginBottom: 6,
  },
  headingBar: {
    height: 2,
    borderRadius: 3,
    marginBottom: 4,
  },

  // HEADER ROW
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },

  // TEAM ROW
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },

  teamCode: {
    width: 28,
    height: 12,
    borderRadius: 3,
    marginRight: 30,
  },

  scoresWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
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
