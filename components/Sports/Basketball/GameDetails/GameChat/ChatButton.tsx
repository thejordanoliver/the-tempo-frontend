import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  gameId: string;
  isOpen: boolean;
  onPress: () => void;
};

function ChatButton({ isOpen, onPress }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => floatingButtonStyles(isDark), [isDark]);

  const opacityAnim = useRef(new Animated.Value(isOpen ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, opacityAnim]);

  return (
    <Animated.View
      pointerEvents={isOpen ? "none" : "auto"}
      style={[styles.floatingButtonWrapper, { opacity: opacityAnim }]}
    >
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name="chatbubble"
          size={24}
          color={isDark ? Colors.black : Colors.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(ChatButton);

const floatingButtonStyles = (isDark: boolean) =>
  StyleSheet.create({
    floatingButtonWrapper: {
      position: "absolute",
      bottom: 100,
      left: 0,
      right: 0,
      alignItems: "flex-end",
      zIndex: 999,
      elevation: 999,
    },
    floatingButton: {
      width: 64,
      height: 64,
      marginHorizontal: 20,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.white : Colors.black,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.5 : 0.3,
      shadowRadius: 4.65,
      elevation: 7,
    },
  });
