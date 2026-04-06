import { Fonts } from "constants/styles";
import React from "react";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

type PostButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  title: string;
};

export default function PostButton({ onPress, disabled }: PostButtonProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDark ? "#fff" : "#000",
          opacity: pressed || disabled ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: isDark ? "#000" : "#fff" }]}>
        Post
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.OSMEDIUM,
  },
});
