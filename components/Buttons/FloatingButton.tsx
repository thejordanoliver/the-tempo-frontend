import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import { useReducedMotion } from "hooks/useReducedMotion";
import { BlurView } from "expo-blur";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  isOpen: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

function FloatingButton({
  isOpen,
  onPress,
  icon = "chatbubble",
  accessibilityLabel,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationBarInset = useContext(NavigationBarInsetContext);
  const styles = useMemo(
    () => FloatingButtonStyles(isDark, navigationBarInset),
    [isDark, navigationBarInset],
  );
  const [opacityAnim] = useState(() => new Animated.Value(isOpen ? 0 : 1));

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isOpen ? 0 : 1,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, opacityAnim, reduceMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden={isOpen}
      importantForAccessibility={isOpen ? "no-hide-descendants" : "auto"}
      aria-hidden={isOpen}
      pointerEvents={isOpen ? "none" : "box-none"}
      style={[
        styles.floatingButtonWrapper,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        disabled={isOpen}
        focusable={!isOpen}
        style={styles.floatingButton}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ??
          (icon === "create" ? "Create post" : "Open game chat")
        }
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        <BlurView intensity={25} style={StyleSheet.absoluteFill} />

        <Ionicons
          name={icon}
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(FloatingButton);

const FloatingButtonStyles = (isDark: boolean, navigationBarInset: number) =>
  StyleSheet.create({
    floatingButtonWrapper: {
      position: "absolute",
      right: 0,
      bottom: 120,
      left: 0,
      zIndex: 999,
      alignItems: "flex-end",
      elevation: 999,
    },

    floatingButton: {
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      marginHorizontal: 20,
      borderRadius: 32,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.white : Colors.black,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: isDark ? 0.5 : 0.3,
      shadowRadius: 4.65,
      elevation: 7,
    },

    touchable: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
  });
