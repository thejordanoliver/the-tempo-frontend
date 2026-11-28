import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useReducedMotion } from "hooks/useReducedMotion";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { settingsDetailStyles } from "styles/SettingsStyles";

const DISPLAY_DURATION_MS = 2400;
const REDUCED_MOTION_DURATION_MS = 1400;
const EXIT_DURATION_MS = 280;

export default function DeleteAccountSplashScreen() {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const reducedMotion = useReducedMotion();
  const isDark = resolvedColorScheme === "dark";
  const theme = Colors[resolvedColorScheme];
  const text = globalStyles(isDark);
  const status = settingsDetailStyles(isDark);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    const duration = reducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : DISPLAY_DURATION_MS;
    screenOpacity.value = 1;

    if (!reducedMotion && process.env.EXPO_OS === "ios") {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }

    const exitTimer = reducedMotion
      ? undefined
      : setTimeout(() => {
          screenOpacity.value = withTiming(0, {
            duration: EXIT_DURATION_MS,
            easing: Easing.in(Easing.cubic),
          });
        }, duration - EXIT_DURATION_MS);
    const navigationTimer = setTimeout(
      () => router.replace("/login"),
      duration,
    );

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigationTimer);
      cancelAnimation(screenOpacity);
    };
  }, [reducedMotion, router, screenOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
        }}
      />
      <Animated.View
        accessible
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        accessibilityLabel="Account deleted. Returning to sign in."
        style={[styles.content, animatedStyle]}
      >
        <View style={status.statusIcon} aria-hidden>
          <Ionicons name="checkmark" size={34} color={theme.green} />
        </View>
        <Text style={[text.heading, styles.centered]}>Account deleted</Text>
        <Text
          style={[
            text.secondaryText,
            styles.centered,
            { color: theme.secondaryText },
          ]}
        >
          Returning to sign in…
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  centered: {
    textAlign: "center",
  },
});
