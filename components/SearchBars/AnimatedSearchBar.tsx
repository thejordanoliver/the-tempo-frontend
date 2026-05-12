import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TextInput } from "react-native";

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
  const anim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null); // ← ref for auto-blur
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = searchBarStyles(isDark);

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
  }, [visible]);

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
      <TextInput
        ref={inputRef} // ← attach ref
        placeholder={placeholder ?? "Search..."}
        placeholderTextColor={Colors.midTone}
        style={styles.input}
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

const searchBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    input: {
      height: 40,
      paddingHorizontal: 10,
      fontSize: 16,
      fontFamily: Fonts.OSLIGHT,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: StyleSheet.hairlineWidth,
      color: isDark ? Colors.white : Colors.black,
    },
  });
