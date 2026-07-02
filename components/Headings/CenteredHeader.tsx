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
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      textAlign: "center",
      color: isDark ? Colors.dark.white : Colors.light.black,
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
    },
  });

export default CenteredHeader;
