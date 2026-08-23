import HeadingThree from "components/Headings/HeadingThree";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function GameRecapSkeleton() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = skeletonStyles(isDark);

  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Recap</HeadingTwo>

      <View style={styles.wrapper}>
        {/* Player of the Game */}
        <View style={styles.playerContainer}>
          <HeadingThree>Player of the Game</HeadingThree>

          <View style={styles.playerRow}>
            <Animated.View
              style={[styles.avatarSkeleton, { opacity: pulse }]}
            />

            <View>
              <Animated.View
                style={[styles.nameSkeleton, { opacity: pulse }]}
              />
              <Animated.View
                style={[styles.teamSkeleton, { opacity: pulse }]}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <Animated.View style={[styles.statSkeleton, { opacity: pulse }]} />
            <View style={styles.divider} />
            <Animated.View style={[styles.statSkeleton, { opacity: pulse }]} />
            <View style={styles.divider} />
            <Animated.View style={[styles.statSkeleton, { opacity: pulse }]} />
          </View>
        </View>

        {/* Recap text */}
        <View>
          {Array.from({ length: 5 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.lineSkeleton,
                { opacity: pulse, width: `${90 - i * 5}%` },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },

    playerContainer: {
      marginBottom: 12,
    },

    playerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    divider: {
      width: 1,
      height: 20,
      marginHorizontal: 8,
      backgroundColor: Colors.midTone,
    },

    avatarSkeleton: {
      width: 44,
      height: 44,
      marginRight: 12,
      borderRadius: 22,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    nameSkeleton: {
      width: 120,
      height: 14,
      marginBottom: 6,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    teamSkeleton: {
      width: 60,
      height: 10,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    statSkeleton: {
      width: 48,
      height: 20,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    lineSkeleton: {
      height: 10,
      marginBottom: 6,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
