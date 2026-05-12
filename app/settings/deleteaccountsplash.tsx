import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export default function DeleteAccountSplashScreen() {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const screenFade = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  const styles = deleteAccountStyles(isDark);
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="" />,
    });
  }, [navigation, isDark]);

  useEffect(() => {
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
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
            router.replace("/login");
          });
        }, 5000);
      });
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFade,
        },
      ]}
    >
      <Animated.Text style={[styles.text, { opacity: textFade }]}>
        We hate to see you go
      </Animated.Text>
    </Animated.View>
  );
}

export const options = {
  // Make the screen fade in instead of slide
  animation: "fade",
  gestureEnabled: false, // optional: disable swipe back
};

const deleteAccountStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    text: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      paddingHorizontal: 20,
      color: isDark ? Colors.white : Colors.black,
    },
  });
