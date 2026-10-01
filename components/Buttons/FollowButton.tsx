import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
} from "react-native";

type FollowButtonProps = {
  isFollowing: boolean | null;
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

  const styles = useMemo(
    () => FollowButtonStyles(isDark, isFollowing ?? false),
    [isDark, isFollowing],
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

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loading && isFollowing !== null) {
      onToggle();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || isFollowing === null}
      style={[styles.followButtonContainer, compactContainerStyle]}
    >
      <View
        pointerEvents="none"
        style={styles.followButtonBackground}
      />

      {isFollowing === null ? (
        <View style={[styles.loadingContainer, compact && styles.compactLoadingContainer]}>
          <ActivityIndicator
            size="small"
            color={isDark ? Colors.white : Colors.black}
          />
        </View>
      ) : (
        <Text style={[styles.followText, compactTextStyle]}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
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

    loadingContainer: {
      paddingVertical: 10,
      alignItems: "center",
    },
    compactLoadingContainer: {
      paddingVertical: 8,
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
