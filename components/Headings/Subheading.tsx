import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
};

export default function Subheading({ children, style }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = SubheadingStyles(isDark);

  return <Text style={[styles.heading, style]}>{children}</Text>;
}

const SubheadingStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      marginBottom: 8,
      paddingBottom: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
