import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface PlayerCardSkeletonListProps {
  count?: number;
  showHeader?: boolean;
}

export default function PlayerCardSkeletonList({
  count = 5,
  showHeader = true,
}: PlayerCardSkeletonListProps) {
  const isDark = useColorScheme() === "dark";
  const styles = skeletonStyles(isDark);

  const pulseAnim = useRef(new Animated.Value(0.3)).current; // start at low opacity

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease), // ✅ use Easing directly
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease), // ✅ use Easing directly
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false } // keeps it perfectly continuous
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const PlayerCardSkeleton = () => (
    <Animated.View
      style={[
        styles.card,
        { opacity: pulseAnim }, // 🔥 pulsing effect here
      ]}
    >
      {/* Avatar placeholder */}
      <View style={styles.avatar} />

      {/* Text placeholders */}
      <View style={styles.textContainer}>
        <View style={styles.nameBar} />
        <View style={styles.statBar} />
      </View>
    </Animated.View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showHeader && <HeaderSkeleton />}
      <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, idx) => (
          <PlayerCardSkeleton key={idx} />
        ))}
      </View>
    </ScrollView>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
    },
    nameBar: {
      width: "50%",
      height: 14,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    statBar: {
      width: 40,
      height: 12,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    listContainer: {
      gap: 12,
    },
    container: {
      paddingBottom: 24,
      paddingHorizontal: 12,
      width: "100%",
    },
  });
