import { Ionicons } from "@expo/vector-icons";
import {
  activeOpacity,
  Colors,
  Fonts,
  MIN_TOUCH_TARGET,
} from "constants/styles";
import { BlurTargetView, BlurView } from "expo-blur";
import { useReducedMotion } from "hooks/useReducedMotion";
import {
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
} from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutRectangle,
  type ScrollViewInstance,
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
  triggerIcon?: ComponentProps<typeof Ionicons>["name"];
  labelLines?: number;
  scrollToSelected?: boolean;
  children?: ReactNode;
};

export default function Dropdown({
  options,
  accessibilityLabel = "Select option",
  selectedValue,
  onSelect,
  isDark,
  width = 180,
  style,
  triggerIcon,
  labelLines = 1,
  scrollToSelected = false,
  children,
}: DropdownProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [visibleOptionCount, setVisibleOptionCount] =
    useState(OPTION_BATCH_SIZE);
  const [anim] = useState(() => new Animated.Value(0));
  const blurTarget = useRef<ComponentRef<typeof BlurTargetView>>(null);
  const optionsScroll = useRef<ScrollViewInstance>(null);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const hasContent = children != null;
  const useAndroidBlur = hasContent && Platform.OS === "android";
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue,
  );

  const styles = DropdownStyles({
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

    setVisibleOptionCount(
      scrollToSelected
        ? selectedIndex + 1 + OPTION_BATCH_SIZE
        : OPTION_BATCH_SIZE,
    );
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
    options[selectedIndex]?.label ?? options[0]?.label ?? "";

  const renderOptions = () => (
    <ScrollView
      ref={optionsScroll}
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
            activeOpacity={activeOpacity}
            onPress={() => handleSelect(option.value)}
            onLayout={
              scrollToSelected && isSelected
                ? ({ nativeEvent }) => {
                    optionsScroll.current?.scrollTo({
                      y: nativeEvent.layout.y,
                      animated: false,
                    });
                  }
                : undefined
            }
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
              numberOfLines={labelLines}
            >
              {option.label}
            </Text>

            {isSelected && (
              <Ionicons
                name="checkmark"
                size={18}
                color={isDark ? Colors.white : Colors.black}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const trigger = (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: selectedLabel }}
      aria-expanded={visible}
      onPress={toggleDropdown}
      style={styles.toggleButton}
    >
      {triggerIcon && (
        <Ionicons
          name={triggerIcon}
          size={18}
          color={isDark ? Colors.dark.text : Colors.light.text}
          style={styles.triggerIcon}
          aria-hidden
        />
      )}
      <Text style={styles.selectedLabel} numberOfLines={labelLines}>
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
  );

  const panel =
    visible && (!hasContent || anchor) ? (
      <Animated.View
        onAccessibilityEscape={closeDropdown}
        style={[
          styles.dropdownPanel,
          hasContent &&
            anchor && {
              left: anchor.x,
              top: anchor.y + anchor.height,
            },
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.fallbackSurface}>
          <BlurView
            intensity={100}
            tint={isDark ? "dark" : "light"}
            pointerEvents="none"
            blurMethod={useAndroidBlur ? "dimezisBlurViewSdk31Plus" : undefined}
            blurTarget={useAndroidBlur ? blurTarget : undefined}
            style={StyleSheet.absoluteFill}
          />
          {renderOptions()}
        </View>
      </Animated.View>
    ) : null;

  if (hasContent) {
    // Keep the panel within the screen's touch bounds and above the content it blurs.
    return (
      <View style={styles.contentArea}>
        <BlurTargetView ref={blurTarget} style={styles.contentArea}>
          <View
            onLayout={({ nativeEvent }) => setAnchor(nativeEvent.layout)}
            style={[{ width }, style]}
          >
            {trigger}
          </View>
          {children}
        </BlurTargetView>
        {panel}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {trigger}
      {panel}
    </View>
  );
}

type DropdownStylesParams = {
  isDark: boolean;
  width: number;
  visible: boolean;
};

export const DropdownStyles = ({
  isDark,
  width,
  visible,
}: DropdownStylesParams) =>
  StyleSheet.create({
    contentArea: {
      flex: 1,
    },

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

    triggerIcon: {
      marginRight: 8,
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
      backgroundColor: "transparent",
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
      borderBottomColor: Colors.midTone,
    },

    selectedOptionButton: {
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },

    optionText: {
      flex: 1,
      marginRight: 8,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    selectedOptionText: {
      color: isDark ? Colors.white : Colors.black,
    },
  });
