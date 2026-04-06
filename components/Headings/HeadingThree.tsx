// components/Heading.tsx
import { Colors, Fonts } from "constants/styles";
import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
type Props = {
  children: React.ReactNode;
};

const HeadingThree: React.FC<Props> = ({ children }) => {
  const isDark = useColorScheme() === "dark";
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
