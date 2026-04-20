// components/Heading.tsx
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { StyleSheet, Text } from "react-native";
type Props = {
  children: React.ReactNode;
};

const HeadingThree: React.FC<Props> = ({ children }) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = headingStyles(isDark);
  return <Text style={styles.heading}>{children}</Text>;
};

const headingStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
  });

export default HeadingThree;
