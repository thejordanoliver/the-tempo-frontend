// components/Heading.tsx
import { Fonts } from "constants/styles";
import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
type Props = {
  children: React.ReactNode;
};

const ScreenHeader: React.FC<Props> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text
      style={[
        styles.heading,
        {
          color: isDark ? "#fff" : "#1d1d1d",
        },
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontFamily: Fonts.OSMEDIUM,
    textAlign: "center",
  },
});

export default ScreenHeader;
