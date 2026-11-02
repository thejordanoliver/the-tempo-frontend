import {
  activeOpacity,
  Colors,
  Fonts,
  MIN_TOUCH_TARGET,
} from "constants/styles";
import React, { ReactNode } from "react";
import {
  AccessibilityRole,
  AccessibilityProps,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type ButtonVariant = "filled" | "outline" | "text";

type ButtonProps = AccessibilityProps & {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  isDark: boolean;
  variant?: ButtonVariant;
  children?: ReactNode;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  hitSlop?: number;
};

export default function Button({
  onPress,
  disabled = false,
  style,
  isDark,
  variant = "filled",
  children,
  accessibilityRole = "button",
  accessibilityLabel,
  accessibilityState,
  hitSlop,
  ...accessibilityProps
}: ButtonProps) {
  const styles = buttonStyles(isDark, variant);

  return (
    <Pressable
      {...accessibilityProps}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed || disabled ? activeOpacity : 1,
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
      minHeight: MIN_TOUCH_TARGET,
      minWidth: MIN_TOUCH_TARGET,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: variant === "filled" ? primary : "transparent",
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
            ? isDark
              ? Colors.dark.secondaryText
              : Colors.light.secondaryText
            : primary,
    },
  });
};
