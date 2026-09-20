import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  children: ReactNode;
};

export default function Subheading({ children }: Props) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const styles = SubheadingStyles(isDark);

  return <Text style={styles.heading}>{children}</Text>;
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
