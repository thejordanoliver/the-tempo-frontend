import TabBar from "components/TabBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  onFocus: () => void;
  onBlur: () => void;
  tabs?: string[];
  selectedTab?: string;
  onTabPress?: (tab: string) => void;
  placeholder?: string; // ← added
};

export default function SearchBar({
  value,
  onChangeText,
  visible,
  onFocus,
  onBlur,
  placeholder,
  tabs = [],
  selectedTab,
  onTabPress,
}: Props) {
  const inputAnim = useRef(new Animated.Value(0)).current;
  const isDark = useColorScheme() === "dark";
  const styles = searchBarStyles(isDark);
  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [visible]);

  return (
    <View>
      <Animated.View
        style={[
          styles.searchBarWrapper,
          {
            width: inputAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            height: inputAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50],
            }),
            opacity: inputAnim,
            marginBottom: inputAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
          },
        ]}
      >
        <TextInput
          placeholder={placeholder ?? "Search..."}
          placeholderTextColor={Colors.midTone}
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Animated.View>

      {visible && tabs.length > 0 && selectedTab && onTabPress && (
        <TabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={onTabPress}
          style={{ marginBottom: 16 }}
        />
      )}
    </View>
  );
}

export const searchBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    searchBarWrapper: {
      overflow: "hidden",
    },
    searchInput: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSLIGHT,
      flex: 1,
      width: "100%"
    },
  });
