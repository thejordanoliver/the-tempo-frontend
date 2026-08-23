// components/Forum/PostItemSkeleton.tsx
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { ForumPostItemSkeletonProps } from "types/forum";

export default function PostItemSkeleton({
  showMedia = true,
}: ForumPostItemSkeletonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const PulseBlock = ({ style }: { style?: any }) => (
    <Animated.View style={[styles.block, style, { opacity: pulse }]} />
  );

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.postContainer}>
        {/* Header row */}
        <View style={styles.userRow}>
          <PulseBlock style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <PulseBlock style={styles.usernameLine} />
          </View>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <PulseBlock style={styles.textLineLg} />
          <PulseBlock style={styles.textLine} />
          <PulseBlock style={styles.textLineMd} />
        </View>

        {/* Media placeholder */}
        {showMedia && <PulseBlock style={styles.media} />}

        {/* Footer actions */}
        <View style={styles.footerRow}>
          <View style={styles.leftActions}>
            <PulseBlock style={styles.iconPill} />
            <PulseBlock style={styles.iconPill} />
          </View>
          <View style={styles.rightActions}>
            <PulseBlock style={styles.iconPill} />
            <PulseBlock style={styles.iconPill} />
          </View>
        </View>

        {/* Timestamp */}
        <PulseBlock style={styles.timeLine} />
      </View>
    </View>
  );
}

function getStyles(isDark: boolean) {
  const base = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const border = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    containerWrapper: {
      paddingTop: 12,
      paddingHorizontal: 12,
    },
    postContainer: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    block: {
      borderRadius: 10,
      backgroundColor: base,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    usernameLine: {
      width: "45%",
      height: 12,
      marginBottom: 6,
      borderRadius: 6,
    },
    subLine: {
      width: "30%",
      height: 10,
      borderRadius: 6,
    },
    textBlock: {
      gap: 8,
      marginTop: 10,
    },
    textLineLg: {
      width: "92%",
      height: 12,
      borderRadius: 6,
    },
    textLine: {
      width: "86%",
      height: 12,
      borderRadius: 6,
    },
    textLineMd: {
      width: "70%",
      height: 12,
      borderRadius: 6,
    },
    media: {
      width: "100%",
      height: 240,
      marginTop: 14,
      borderRadius: 12,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    leftActions: {
      flexDirection: "row",
      gap: 12,
    },
    rightActions: {
      flexDirection: "row",
      gap: 12,
    },
    iconPill: {
      width: 40,
      height: 22,
      borderRadius: 11,
    },
    timeLine: {
      width: "28%",
      height: 10,
      marginTop: 12,
      borderRadius: 6,
    },
  });
}
