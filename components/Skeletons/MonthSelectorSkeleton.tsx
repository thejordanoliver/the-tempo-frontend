import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const ITEM_WIDTH = 70;
const ITEM_HEIGHT = 44;
const SIDE_PADDING = 12;
const ITEM_SPACING = 0;

type Props = {
  itemCount?: number;
};

export default function MonthSelectorSkeleton({ itemCount = 5 }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width,
  );

  const itemStep = ITEM_WIDTH + ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      itemCount * ITEM_WIDTH +
      ITEM_SPACING * Math.max(0, itemCount - 1)
    );
  }, [itemCount]);

  const needsScroll = rawItemsWidth + SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? SIDE_PADDING
    : Math.max((containerWidth - rawItemsWidth) / 2, SIDE_PADDING);

  const styles = getStyles(isDark, horizontalPadding);

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const SkeletonBlock = ({ style }: { style: object }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  return (
    <View style={styles.monthSelector} onLayout={onLayoutContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemStep}
        decelerationRate="fast"
        scrollEnabled={needsScroll}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.monthButton}>
            <SkeletonBlock style={styles.monthText} />
            <SkeletonBlock style={styles.gameCountText} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, horizontalPadding: number) =>
  StyleSheet.create({
    monthSelector: {
      flexDirection: "row",
      marginVertical: 8,
    },
    contentContainerStyle: {
      position: "relative",
      paddingHorizontal: horizontalPadding,
      alignItems: "center",
    },
    monthButton: {
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
      borderRadius: 12,
    },
    monthText: {
      width: 38,
      height: 17,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    gameCountText: {
      marginTop: 4,
      width: 52,
      height: 10,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });