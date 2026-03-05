import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const ITEM_WIDTH = 70;
const SPACING = 12;

export default function MonthSelectorSkeleton({
  itemCount = 4,
}: {
  itemCount?: number;
}) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const screenWidth = Dimensions.get("window").width;
  const contentWidth =
    itemCount * ITEM_WIDTH + (itemCount - 1) * SPACING;

  const needsScroll = contentWidth > screenWidth;

  // Pulse animation
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

  const SkeletonBlock = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  return (
    <View
      style={[
        styles.container,
        !needsScroll && {
          width: screenWidth,
          justifyContent: "space-around",
        },
      ]}
    >
      {Array.from({ length: itemCount }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.buttonContainer,
            { marginHorizontal: SPACING / 2 },
          ]}
        >
          <SkeletonBlock style={styles.month} />
          <SkeletonBlock style={styles.gameCount} />
        </View>
      ))}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: SPACING / 2,
    },
    buttonContainer: {
      width: ITEM_WIDTH,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    month: {
      width: 40,
      height: 18, // closer to fontSize 20
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    gameCount: {
      width: 52,
      height: 12,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
