import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, MIN_TOUCH_TARGET } from "constants/styles";
import { BlurView } from "expo-blur";
import { useReducedMotion } from "hooks/useReducedMotion";
import { useMemo, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const OPTION_BATCH_SIZE = 20;

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  accessibilityLabel?: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  isDark: boolean;
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Dropdown({
  options,
  accessibilityLabel = "Select option",
  selectedValue,
  onSelect,
  isDark,
  width = 180,
  style,
}: DropdownProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [visibleOptionCount, setVisibleOptionCount] =
    useState(OPTION_BATCH_SIZE);
  const [anim] = useState(() => new Animated.Value(0));

  const styles = dropDownStyles({
    isDark,
    width,
    visible,
  });

  const translateY = useMemo(
    () =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
      }),
    [anim],
  );

  const rotate = useMemo(
    () =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [anim],
  );

  const openDropdown = () => {
    anim.stopAnimation();

    setVisibleOptionCount(OPTION_BATCH_SIZE);
    setVisible(true);

    Animated.timing(anim, {
      toValue: 1,
      duration: reduceMotion ? 0 : 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    anim.stopAnimation();

    Animated.timing(anim, {
      toValue: 0,
      duration: reduceMotion ? 0 : 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  };

  const toggleDropdown = () => {
    if (visible) {
      closeDropdown();
      return;
    }

    openDropdown();
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    closeDropdown();
  };

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ??
    options[0]?.label ??
    "";

  const renderOptions = () => (
    <ScrollView
      style={styles.optionsScrollView}
      contentContainerStyle={styles.optionsContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={({ nativeEvent }) => {
        const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
        if (
          visibleOptionCount < options.length &&
          contentOffset.y + layoutMeasurement.height >= contentSize.height - 80
        ) {
          setVisibleOptionCount((count) =>
            Math.min(
              options.length,
              Math.max(count, visibleOptionCount + OPTION_BATCH_SIZE),
            ),
          );
        }
      }}
    >
      {options.slice(0, visibleOptionCount).map((option, index) => {
        const isSelected = selectedValue === option.value;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            activeOpacity={0.7}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.optionButton,
              !isLast && styles.optionBorder,
              isSelected && styles.selectedOptionButton,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>

            {isSelected ? (
              <Ionicons
                name="checkmark"
                size={18}
                color={
                  isDark
                    ? Colors.dark.secondaryText
                    : Colors.light.actionBackground
                }
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: selectedLabel }}
        accessibilityState={{ expanded: visible }}
        onPress={toggleDropdown}
        style={styles.toggleButton}
      >
        <Text style={styles.selectedLabel} numberOfLines={1}>
          {selectedLabel}
        </Text>

        <Animated.View
          style={[
            styles.chevronContainer,
            {
              transform: [{ rotate }],
            },
          ]}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Animated.View>
      </TouchableOpacity>

      {visible ? (
        <Animated.View
          onAccessibilityEscape={closeDropdown}
          style={[
            styles.dropdownPanel,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.fallbackSurface}>
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />

            {renderOptions()}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

type DropDownStylesParams = {
  isDark: boolean;
  width: number;
  visible: boolean;
};

export const dropDownStyles = ({
  isDark,
  width,
  visible,
}: DropDownStylesParams) =>
  StyleSheet.create({
    container: {
      position: "relative",
      zIndex: visible ? 9999 : 1,
      width,
      elevation: visible ? 9999 : 1,
    },

    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      minHeight: MIN_TOUCH_TARGET,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },

    selectedLabel: {
      flex: 1,
      marginRight: 8,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },

    chevronContainer: {
      alignItems: "center",
      justifyContent: "center",
    },

    dropdownPanel: {
      position: "absolute",
      top: "100%",
      marginTop: 6,
      left: 0,
      zIndex: 9999,
      width,
      maxHeight: 260,
      borderRadius: 12,

      shadowColor: Colors.black,
      boxShadow:
        Platform.OS === "android"
          ? undefined
          : `0px 4px 16px ${Colors.black}33`,

      elevation: 9999,
    },

    glassSurface: {
      width: "100%",
      maxHeight: 260,
      overflow: "hidden",
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.12)",
    },

    fallbackSurface: {
      width: "100%",
      maxHeight: 260,
      overflow: "hidden",
      borderRadius: 12,

      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,

      borderWidth: StyleSheet.hairlineWidth,

      borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.12)",
    },

    optionsScrollView: {
      maxHeight: 260,
    },

    optionsContent: {
      paddingVertical: 0,
    },

    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: MIN_TOUCH_TARGET,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },

    optionBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,

      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.08)",
    },

    selectedOptionButton: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
    },

    optionText: {
      flex: 1,
      marginRight: 8,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },

    selectedOptionText: {
      color: isDark ? Colors.dark.secondaryText : Colors.light.actionBackground,
    },
  });
