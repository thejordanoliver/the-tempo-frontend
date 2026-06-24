import { Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export default function SignupSuccessScreen() {
  const router = useRouter();
  const { token, id } = useLocalSearchParams();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const screenFade = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Fade in screen
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Step 2: Fade in text
      Animated.timing(textFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Step 3: Wait, then fade out both
        const timeout = setTimeout(() => {
          Animated.parallel([
            Animated.timing(textFade, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(screenFade, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // ✅ Redirect to profile with token + id
            router.replace({
              pathname: "/(tabs)/profile",
              params: { id, token },
            });
          });
        }, 3500); // shorter delay for smoother UX

        return () => clearTimeout(timeout);
      });
    });
  }, [id, router, screenFade, textFade, token]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFade,
          backgroundColor: isDark ? "#1d1d1d" : "#fff",
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.text,
          { color: isDark ? "#fff" : "#1d1d1d", opacity: textFade },
        ]}
      >
        {"You're All Set!"}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 32,
    fontFamily: Fonts.OSBOLD,
  },
});
