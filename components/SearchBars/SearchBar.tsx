import React, { useRef } from "react";
import { TextInput, View } from "react-native";
import BaseSearchInput from "./BaseSearchInput";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  return (
    <View>
      <BaseSearchInput
        ref={inputRef} // ← attach ref
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  );
}
