import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
} from "react-native";

type FollowButtonProps = {
  isFollowing: boolean;
  loading?: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export default function FollowButton({
  isFollowing,
  loading = false,
  onToggle,
  compact = false,
}: FollowButtonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const [displayedFollowing, setDisplayedFollowing] = useState(isFollowing);

  const previousFollowing = useRef(isFollowing);
  const animation = useMemo(() => new Animated.Value(1), []);

  const styles = useMemo(
    () => FollowButtonStyles(isDark, displayedFollowing),
    [isDark, displayedFollowing],
  );

  const compactContainerStyle = useMemo(
    () =>
      compact
        ? {
            width: 80,
            marginVertical: 4,
            borderRadius: 8,
          }
        : undefined,
    [compact],
  );

  const compactTextStyle = useMemo(
    () =>
      compact
        ? {
            fontSize: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
          }
        : undefined,
    [compact],
  );

  useEffect(() => {
    if (previousFollowing.current === isFollowing) {
      return;
    }

    previousFollowing.current = isFollowing;

    animation.setValue(1);

    const fadeOut = Animated.timing(animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    });

    fadeOut.start(({ finished }) => {
      if (!finished) {
        return;
      }

      setDisplayedFollowing(isFollowing);
      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      fadeOut.stop();
      animation.stopAnimation();
    };
  }, [isFollowing, animation]);

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loading) {
      onToggle();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={[styles.followButtonContainer, compactContainerStyle]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.followButtonBackground,
          {
            opacity: animation,
          },
        ]}
      />

      <Animated.Text
        style={[
          styles.followText,
          compactTextStyle,
          {
            opacity: animation,
          },
        ]}
      >
        {displayedFollowing ? "Following" : "Follow"}
      </Animated.Text>
    </Pressable>
  );
}

export const FollowButtonStyles = (isDark: boolean, isFollowing?: boolean) => {
  const backgroundColor = isFollowing
    ? isDark
      ? Colors.white
      : Colors.black
    : isDark
      ? Colors.black
      : Colors.white;

  const borderColor = isFollowing
    ? Colors.black
    : isDark
      ? Colors.white
      : Colors.black;

  const textColor = isFollowing
    ? isDark
      ? Colors.black
      : Colors.white
    : isDark
      ? Colors.white
      : Colors.black;

  return StyleSheet.create({
    followButtonContainer: {
      position: "relative",
      width: 120,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 1,
      borderColor,
    },

    followButtonBackground: {
      ...StyleSheet.absoluteFill,
      backgroundColor,
    },

    followText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: textColor,
      textAlign: "center",
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
  });
};
