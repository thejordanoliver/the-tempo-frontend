import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

export default function SearchItemSkeleton() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  // Shared pulse animation for all skeleton parts
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

  function SkeletonBlock({ style }: { style: any }) {
    return <Animated.View style={[style, { opacity: pulseAnim }]} />;
  }
  const borderBottomColor = pulseAnim.interpolate({
    inputRange: [0.3, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.midTone,
      isDark ? Colors.lightGray : Colors.midTone,
    ],
  });

  return (
    <Animated.View style={[styles.card, { borderBottomColor }]}>
      {/* Top Team */}
      <View style={styles.itemContainer}>
        <SkeletonBlock style={styles.avatarContainer} />
        <View style={styles.textContainer}>
          <SkeletonBlock style={styles.name} />

          <SkeletonBlock style={styles.subText} />
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "space-evenly",
      borderBottomWidth: 1,
    },
    itemContainer: {
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flex: 1,
    },
    avatarContainer: {
      width: 44,
      height: 44,
      borderRadius: 24,
      marginRight: 12,
      overflow: "hidden",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    textContainer: {
      gap: 4,
    },
    name: {
      height: 10,
      width: 120,
      borderRadius: 24,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    subText: {
      height: 8,
      width: 50,
      borderRadius: 24,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
