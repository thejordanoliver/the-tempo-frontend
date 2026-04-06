import { Colors, Fonts } from "constants/styles";
import React, { useRef } from "react";
import { StyleSheet, TextInput, useColorScheme, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;

  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  const isDark = useColorScheme() === "dark";
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
      height: 40,
      paddingHorizontal: 10,
      fontSize: 16,
      fontFamily: Fonts.OSLIGHT,
      color: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
  });
