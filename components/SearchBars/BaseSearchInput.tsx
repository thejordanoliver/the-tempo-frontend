import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export type BaseSearchInputProps = Omit<
  TextInputProps,
  "placeholderTextColor"
>;

const BaseSearchInput = forwardRef<TextInput, BaseSearchInputProps>(
  ({ placeholder = "Search...", style, ...props }, ref) => {
    const { resolvedColorScheme } = usePreferences();
    const isDark = resolvedColorScheme === "dark";

    return (
      <TextInput
        ref={ref}
        {...props}
        placeholder={placeholder}
        placeholderTextColor={Colors.midTone}
        style={[styles.input, getThemeStyle(isDark), style]}
        autoCapitalize={props.autoCapitalize ?? "none"}
      />
    );
  },
);

BaseSearchInput.displayName = "BaseSearchInput";

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 40,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    fontFamily: Fonts.LIGHT,
    fontSize: 16,
  },
});

const getThemeStyle = (isDark: boolean) => ({
  borderColor: isDark ? Colors.darkGray : Colors.lightGray,
  backgroundColor: isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground,
  color: isDark ? Colors.white : Colors.black,
});

export default BaseSearchInput;
