import { Colors, Fonts } from "constants/styles";
import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type ButtonVariant = "filled" | "outline" | "text";

type ButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  isDark: boolean;
  variant?: ButtonVariant;
  children?: ReactNode;
};

export default function Button({
  onPress,
  disabled = false,
  style,
  isDark,
  variant = "filled",
  children,
}: ButtonProps) {
  const styles = buttonStyles(isDark, variant);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed || disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {React.Children.map(children ?? "Save", (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text style={styles.buttonText}>{child}</Text>
        ) : (
          child
        ),
      )}
    </Pressable>
  );
}

const buttonStyles = (isDark: boolean, variant: ButtonVariant) => {
  const primary = isDark ? Colors.white : Colors.black;
  const primaryText = isDark ? Colors.black : Colors.white;

  return StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,

      backgroundColor:
        variant === "filled" ? primary : "transparent",

      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: primary,
    },

    buttonText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,

      color:
        variant === "filled"
          ? primaryText
          : variant === "text"
            ? Colors.midTone
            : primary,
    },
  });
};