import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

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
  const isDark = useColorScheme() === "dark";
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
      color: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
  });
