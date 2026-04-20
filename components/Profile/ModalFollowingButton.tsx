import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type Props = {
  isFollowing: boolean;
  onToggle: () => void;
  loading?: boolean;
};

export default function FollowingButton({ isFollowing, onToggle }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const styles = followButtonStyles(isDark, isFollowing);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFollowing]);

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(); // no guard
  };

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Pressable onPress={handlePress} style={styles.wrapper}>
        <Text style={styles.buttonText}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export const followButtonStyles = (isDark: boolean, isFollowing: boolean) =>
  StyleSheet.create({
    container: {
      width: 80,
      overflow: "hidden",
      marginVertical: 4,
    },
    wrapper: {
      backgroundColor: isFollowing
        ? isDark
          ? Colors.white
          : Colors.black
        : "transparent",
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    buttonText: {
      color: isFollowing
        ? isDark
          ? Colors.black
          : Colors.white
        : isDark
          ? Colors.white
          : Colors.black,
      fontSize: 12,
      fontFamily: Fonts.OSMEDIUM,
    },
  });
