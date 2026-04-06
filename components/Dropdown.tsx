import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isDark: boolean;
  width?: number;
  style?: ViewStyle;
  absolute?: boolean; // ✅ NEW
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  isDark,
  width = 180,
  style,
  absolute = false, // default off
}) => {
  const [visible, setVisible] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    } else {
      setVisible(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const handleSelect = (value: string) => {
    onSelect(value);
    toggleDropdown();
  };

  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label ?? "";

  return (
    <View
      style={[
        absolute
          ? {
              position: "absolute",
              right: 16,
              top: 14,
              zIndex: 999,
              alignItems: "flex-end",
            }
          : { alignItems: "flex-end" }, // 🔥 Normal flow
        style,
      ]}
    >
      {/* TRIGGER BUTTON */}
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#888",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? Colors.white : Colors.black,
            fontFamily: Fonts.OSMEDIUM,
            marginRight: 8,
          }}
        >
          {selectedLabel}
        </Text>

        <Animated.View
          style={{
            transform: [
              {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown panel */}
      {visible && (
        <Animated.View
          style={{
            position: "absolute",
            top: 48,
            width,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 9999,
            opacity: anim,
            transform: [{ translateY }],
          }}
        >
          <BlurView
            intensity={100}
            tint="systemUltraThinMaterial"
            style={StyleSheet.absoluteFillObject}
          />

          {/* ⭐ SCROLLABLE LIST */}
          <ScrollView
            style={{ maxHeight: 260 }}
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                style={{ paddingVertical: 12, paddingHorizontal: 16 }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.OSMEDIUM,
                    color:
                      selectedValue === opt.value
                        ? isDark
                          ? "#0af"
                          : "#06f"
                        : isDark
                          ? Colors.white
                          : Colors.black,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};
