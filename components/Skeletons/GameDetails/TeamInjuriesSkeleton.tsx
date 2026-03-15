import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import HeaderSkeleton from "../HeaderSkeleton";

type Props = {
  rows?: number;
  lighter?: boolean;
};

export default function TeamInjuriesSkeleton({ rows = 4 }: Props) {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const borderPulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const border = Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(borderPulse, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    pulse.start();
    border.start();

    return () => {
      pulse.stop();
      border.stop();
    };
  }, []);

  const styles = skeletonStyles(isDark);
  const borderBottomColor = borderPulse.interpolate({
    inputRange: [0.3, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.midTone,
      isDark ? Colors.lightGray : Colors.midTone,
    ],
  });
  return (
    <View>
      <HeaderSkeleton />

      <View style={styles.wrapper}>
        {/* Tabs Skeleton */}
        <View style={styles.tabContainer}>
          {[0, 1].map((idx) => (
            <View key={idx} style={styles.tabItem}>
              <Animated.View
                style={[
                  styles.teamLogo,
                  styles.skeleton,
                  { opacity: pulseAnim },
                ]}
              />

              <Animated.View
                style={[
                  styles.teamName,
                  styles.skeleton,
                  { opacity: pulseAnim },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Player Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.row,
              i !== rows - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor,
              },
            ]}
          >
            <Animated.View
              style={[styles.avatar, styles.skeleton, { opacity: pulseAnim }]}
            />

            <View style={styles.textContainer}>
              <Animated.View
                style={[styles.name, styles.skeleton, { opacity: pulseAnim }]}
              />

              <Animated.View
                style={[styles.detail, styles.skeleton, { opacity: pulseAnim }]}
              />

              <Animated.View
                style={[styles.status, styles.skeleton, { opacity: pulseAnim }]}
              />
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },

    skeleton: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    tabContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 12,
    },

    tabItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    teamLogo: {
      width: 28,
      height: 28,
      borderRadius: 100,
    },

    teamName: {
      width: 70,
      height: 20,
      borderRadius: 6,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      height: 80,
      paddingHorizontal: 12,
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    textContainer: {
      marginLeft: 10,
      flex: 1,
      justifyContent: "center",
      gap: 6,
    },

    name: {
      height: 14,
      width: "35%",
      borderRadius: 4,
    },

    detail: {
      height: 12,
      width: "20%",
      borderRadius: 4,
    },

    status: {
      height: 10,
      width: "25%",
      borderRadius: 4,
    },
  });
