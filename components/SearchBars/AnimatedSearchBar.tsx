import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, TextInput } from "react-native";
import BaseSearchInput from "./BaseSearchInput";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  visible: boolean;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  visible,
  placeholder,
}: Props) {
  const [anim] = useState(() => new Animated.Value(0));
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    // 🔥 Auto-blur the input whenever search closes
    if (!visible) {
      inputRef.current?.blur();
    }
  }, [anim, visible]);

  return (
    <Animated.View
      style={{
        height: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 40],
        }),
        opacity: anim,
        overflow: "hidden",
      }}
      pointerEvents={visible ? "auto" : "none"} // disable touches when closed
    >
      <BaseSearchInput
        ref={inputRef} // ← attach ref
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        editable={visible} // disable typing
        showSoftInputOnFocus={visible} // ✅ blocks keyboard entirely
        caretHidden={!visible}
      />
    </Animated.View>
  );
}
