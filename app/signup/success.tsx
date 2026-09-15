import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";

const DISPLAY_DURATION_MS = 2400;
const REDUCED_MOTION_DURATION_MS = 1400;
const EXIT_DURATION_MS = 280;

export default function SignupSuccessScreen() {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const reducedMotion = useReducedMotion();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  const screenOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const badgeScale = useSharedValue(reducedMotion ? 1 : 0.7);
  const badgeOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const copyOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const copyTranslateY = useSharedValue(reducedMotion ? 0 : 12);

  useEffect(() => {
    const displayDuration = reducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : DISPLAY_DURATION_MS;

    if (reducedMotion) {
      screenOpacity.value = 1;
      badgeScale.value = 1;
      badgeOpacity.value = 1;
      copyOpacity.value = 1;
      copyTranslateY.value = 0;
    } else {
      screenOpacity.value = withTiming(1, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      badgeOpacity.value = withDelay(
        100,
        withTiming(1, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        }),
      );
      badgeScale.value = withDelay(
        100,
        withSpring(1, {
          damping: 14,
          mass: 0.8,
          stiffness: 170,
        }),
      );
      copyOpacity.value = withDelay(
        300,
        withTiming(1, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        }),
      );
      copyTranslateY.value = withDelay(
        300,
        withTiming(0, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
        }),
      );

      if (process.env.EXPO_OS === "ios") {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {
          // Haptics are optional and should never block the signup flow.
        });
      }
    }

    const exitTimer = reducedMotion
      ? undefined
      : setTimeout(() => {
          screenOpacity.value = withTiming(0, {
            duration: EXIT_DURATION_MS,
            easing: Easing.in(Easing.cubic),
          });
        }, displayDuration - EXIT_DURATION_MS);

    const navigationTimer = setTimeout(() => {
      router.replace("/(tabs)/profile");
    }, displayDuration);

    return () => {
      if (exitTimer) {
        clearTimeout(exitTimer);
      }
      clearTimeout(navigationTimer);
      cancelAnimation(screenOpacity);
      cancelAnimation(badgeScale);
      cancelAnimation(badgeOpacity);
      cancelAnimation(copyOpacity);
      cancelAnimation(copyTranslateY);
    };
  }, [
    badgeOpacity,
    badgeScale,
    copyOpacity,
    copyTranslateY,
    reducedMotion,
    router,
    screenOpacity,
  ]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <View
        accessibilityLabel="Account created. You're all set."
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={styles.content}
      >
        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
          <Text accessibilityElementsHidden style={styles.checkmark}>
            ✓
          </Text>
        </Animated.View>

        <Animated.View style={[styles.copy, copyAnimatedStyle]}>
          <Text style={styles.title}>{"You're All Set!"}</Text>
          <Text style={styles.subtitle}>Your Tempo profile is ready.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    content: {
      alignItems: "center",
      gap: 24,
    },
    badge: {
      width: 88,
      height: 88,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 44,
      backgroundColor: isDark ? Colors.dark.green : Colors.light.green,
    },
    checkmark: {
      color: Colors.white,
      fontFamily: Fonts.BOLD,
      fontSize: 48,
      lineHeight: 58,
      textAlign: "center",
    },
    copy: {
      alignItems: "center",
      gap: 6,
    },
    title: {
      fontFamily: Fonts.BOLD,
      fontSize: 32,
      lineHeight: 40,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      lineHeight: 24,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
