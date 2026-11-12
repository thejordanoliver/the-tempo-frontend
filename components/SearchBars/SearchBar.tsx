import React, { useRef } from "react";
import { View, type TextInputInstance } from "react-native";
import BaseSearchInput from "./BaseSearchInput";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  editable?: boolean;
  placeholder?: string;
  autoCorrect?: boolean;
  accessibilityLabel?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  autoCorrect = false,
  autoCapitalize = "none",
  editable,
}: Props) {
  const inputRef = useRef<TextInputInstance>(null); // ← ref for auto-blur
  return (
    <View>
      <BaseSearchInput
        ref={inputRef} // ← attach ref
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={accessibilityLabel}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  );
}
