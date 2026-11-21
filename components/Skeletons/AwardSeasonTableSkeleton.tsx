import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useReducedMotion } from "hooks/useReducedMotion";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AwardTableStyles } from "styles/LeagueStyles/AwardTableSyles";

const ROWS = 25;

type Props = {
  lighter?: boolean;
  teams?: number;
  showTeamHeader?: boolean;
  variant?: "players" | "champions" | "schools";
};

export default function AwardSeasonTableSkeleton({
  teams = 1,
  variant = "players",
}: Props) {
  const reduceMotion = useReducedMotion();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const tableStyles = AwardTableStyles(isDark);
  const placeholderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      pulseAnim.setValue(0.7);
      return;
    }

    const animation = Animated.loop(
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
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim, reduceMotion]);

  const placeholderStyle = {
    backgroundColor: placeholderColor,
    opacity: pulseAnim,
  };
  const isSchools = variant === "schools";

  return (
    <View>
      {Array.from({ length: teams }, (_, teamIndex) => (
        <View key={teamIndex} style={tableStyles.table}>
          <View
            style={[tableStyles.headerRow, isSchools && styles.schoolHeader]}
          >
            <Animated.View style={[styles.header, placeholderStyle]} />
          </View>
          {Array.from({ length: ROWS }, (_, index) => (
            <View
              key={index}
              style={[
                tableStyles.nameRow,
                isSchools && styles.schoolRow,
                !isSchools &&
                  index % 2 === 1 && {
                    backgroundColor: isDark
                      ? Colors.dark.itemBackground
                      : Colors.light.itemBackground,
                  },
                index === ROWS - 1 && styles.lastRow,
              ]}
            >
              <View style={[tableStyles.leftContainer, styles.left]}>
                {variant !== "players" && (
                  <Animated.View
                    style={[
                      tableStyles.teamLogo,
                      styles.placeholder,
                      placeholderStyle,
                    ]}
                  />
                )}
                <Animated.View style={[styles.name, placeholderStyle]} />
              </View>
              <View style={tableStyles.rightContainer}>
                <Animated.View style={[styles.season, placeholderStyle]} />
                {isSchools && (
                  <Animated.View
                    style={[styles.playerCount, placeholderStyle]}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { borderRadius: 4 },
  header: {
    width: "55%",
    height: 20,
    marginHorizontal: 10,
    borderRadius: 4,
  },
  left: { flex: 1, paddingRight: 12 },
  name: { width: 120, maxWidth: "70%", height: 14, borderRadius: 4 },
  season: { width: 40, height: 14, borderRadius: 4 },
  playerCount: { width: 55, height: 12, marginTop: 6, borderRadius: 4 },
  schoolHeader: { borderBottomColor: Colors.midTone },
  schoolRow: { height: "auto", minHeight: 68, padding: 14 },
  lastRow: { borderBottomWidth: 0 },
});
