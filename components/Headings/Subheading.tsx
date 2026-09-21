import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextStyle, View } from "react-native";

type Props = {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function Subheading({
  children,
  style,
  collapsible = false,
  collapsed = false,
  onToggle,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = SubheadingStyles(isDark);

  if (collapsible) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${collapsed ? "Expand" : "Collapse"} ${String(children)}`}
        accessibilityState={{ expanded: !collapsed }}
        hitSlop={8}
        onPress={onToggle}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        <Text style={[styles.heading, styles.collapsibleHeading, style]}>
          {children}
        </Text>
        <Ionicons
          name={collapsed ? "chevron-forward" : "chevron-down"}
          size={20}
          color={isDark ? Colors.lightGray : Colors.darkGray}
        />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, style]}>{children}</Text>
    </View>
  );
}

const SubheadingStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      marginBottom: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    collapsibleHeading: {
      flex: 1,
    },
    pressed: {
      opacity: 0.6,
    },
  });
