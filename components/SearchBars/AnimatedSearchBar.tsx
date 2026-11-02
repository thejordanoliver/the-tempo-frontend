import { useReducedMotion } from "hooks/useReducedMotion";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, TextInput, useWindowDimensions } from "react-native";
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
  const reduceMotion = useReducedMotion();
  const { fontScale } = useWindowDimensions();
  const expandedHeight = Math.max(48, 28 + 20 * fontScale);
  const [anim] = useState(() => new Animated.Value(0));
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: reduceMotion ? 0 : 260,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    // 🔥 Auto-blur the input whenever search closes
    if (!visible) {
      inputRef.current?.blur();
    }
  }, [anim, visible, reduceMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      aria-hidden={!visible}
      style={{
        height: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, expandedHeight],
        }),
        opacity: anim,
        overflow: "hidden",
      }}
      pointerEvents={visible ? "auto" : "none"} // disable touches when closed
    >
      <BaseSearchInput
        tabIndex={visible ? 0 : -1}
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
