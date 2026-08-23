import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = searchBarStyles(isDark);

  return (
    <View>
      <TextInput
        ref={inputRef} // ← attach ref
        placeholder={placeholder ?? "Search..."}
        placeholderTextColor={Colors.midTone}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  );
}

const searchBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    input: {
      width: "100%",
      height: 40,
      paddingHorizontal: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
  });
