import { Ionicons } from "@expo/vector-icons";
import TabBar from "components/TabBars/TabBar";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TextInput,
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
  placeholder?: string;
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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = searchBarStyles(isDark);

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [inputAnim, visible]);

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
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={placeholder ?? "Search..."}
            placeholderTextColor={Colors.midTone}
            style={styles.searchInput}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={onFocus}
            onBlur={onBlur}
            accessibilityLabel="Explore search"
          />
          {value.length > 0 && (
            <Pressable
              onPress={() => onChangeText("")}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={Colors.midTone} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {visible && tabs.length > 0 && selectedTab && onTabPress && (
        <TabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={onTabPress}
          style={{ marginBottom: 16 }}
          isDark={isDark}
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
    inputContainer: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
    },
    searchInput: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSLIGHT,
      flex: 1,
    },
    clearButton: {
      position: "absolute",
      right: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });
