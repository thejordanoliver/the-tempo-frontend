import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "constants/fonts";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  isDark,
  width = 180,
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
      style={{
        alignItems: "flex-end",
        marginBottom: 10,
        position: "absolute",
        right: 16,
        top: 14,
        zIndex: 999,
      }}
    >
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? "#888" : "#888",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? "#fff" : "#1d1d1d",
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
            color={isDark ? "#fff" : "#1d1d1d"}
          />
        </Animated.View>
      </TouchableOpacity>

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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <BlurView
            intensity={100}
            tint="systemUltraThinMaterial"
            style={StyleSheet.absoluteFillObject}
          />
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              style={{ paddingVertical: 12, paddingHorizontal: 16 }}
            >
              <Text
                style={{
                  color:
                    selectedValue === opt.value
                      ? isDark
                        ? "#0af"
                        : "#06f"
                      : isDark
                      ? "#fff"
                      : "#000",
                  fontFamily: Fonts.OSMEDIUM,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};
