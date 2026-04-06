// components/Forum/PostItemSkeleton.tsx
import { Colors } from "constants/styles";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

type Props = {
  showMedia?: boolean; // set true if your post can have images/videos
};

export default function PostItemSkeleton({ showMedia = true }: Props) {
  const isDark = useColorScheme() === "dark";
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
      borderBottomColor: border,
      borderBottomWidth: 1,
      paddingVertical: 10,
    },
    block: {
      backgroundColor: base,
      borderRadius: 10,
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
      height: 12,
      width: "45%",
      borderRadius: 6,
      marginBottom: 6,
    },
    subLine: {
      height: 10,
      width: "30%",
      borderRadius: 6,
    },
    textBlock: {
      marginTop: 10,
      gap: 8,
    },
    textLineLg: {
      height: 12,
      width: "92%",
      borderRadius: 6,
    },
    textLine: {
      height: 12,
      width: "86%",
      borderRadius: 6,
    },
    textLineMd: {
      height: 12,
      width: "70%",
      borderRadius: 6,
    },
    media: {
      marginTop: 14,
      width: "100%",
      height: 240,
      borderRadius: 12,
    },
    footerRow: {
      marginTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftActions: { flexDirection: "row", gap: 12 },
    rightActions: { flexDirection: "row", gap: 12 },
    iconPill: {
      width: 40,
      height: 22,
      borderRadius: 11,
    },
    timeLine: {
      marginTop: 12,
      height: 10,
      width: "28%",
      borderRadius: 6,
    },
  });
}
