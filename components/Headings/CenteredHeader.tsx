// components/Heading.tsx
import { Colors, Fonts } from "constants/styles";
import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  isDark: boolean;
  style?: TextStyle | TextStyle[];
};

const CenteredHeader: React.FC<Props> = ({ children, isDark, style }) => {
  const styles = headerStyles(isDark);

  return <Text style={[styles.heading, style]}>{children}</Text>; // ✅ merge styles
};

const headerStyles = (isDark: boolean) =>
  StyleSheet.create({
    heading: {
      marginBottom: 12,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
      fontFamily: Fonts.MEDIUM,
      fontSize: 20,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textAlign: "center",
    },
  });

export default CenteredHeader;
