import HeadingThree from "components/Headings/HeadingThree";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

export default function GameRecapSkeleton() {
  const isDark = useColorScheme() === "dark";
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
      <HeadingTwo>Game Recap</HeadingTwo>

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
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors.midTone,
      padding: 12,
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
      height: 20,
      width: 1,
      marginHorizontal: 8,
      backgroundColor: Colors.midTone,
    },

    avatarSkeleton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    nameSkeleton: {
      width: 120,
      height: 14,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginBottom: 6,
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
      borderRadius: 4,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginBottom: 6,
    },
  });
