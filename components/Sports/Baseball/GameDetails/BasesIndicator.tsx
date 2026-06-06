import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import React, { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

type Bases = {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
};

type BasesIndicatorProps = {
  bases: Bases;
  size?: number;
  isDark: boolean;
};

type PulsingBaseProps = {
  occupied: boolean;
  size: number;
  colorOccupied: string;
  colorEmpty: string;
  tx: number;
  ty: number;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

function usePulseOnOccupy(occupied: boolean) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevOccupied = useRef(occupied);

  useEffect(() => {
    if (!prevOccupied.current && occupied) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevOccupied.current = occupied;
  }, [occupied, scale]);

  return scale;
}

// ─── PulsingBase ─────────────────────────────────────────────────────────────

const PulsingBase = memo(
  function PulsingBase({
    occupied,
    size,
    colorOccupied,
    colorEmpty,
    tx,
    ty,
  }: PulsingBaseProps) {
    const scale = usePulseOnOccupy(occupied);

    return (
      <Animated.View
        style={[
          styles.baseContainer,
          {
            width: size,
            height: size,
            transform: [{ translateX: tx }, { translateY: ty }, { rotate: "45deg" }, { scale }],
          },
        ]}
      >
        <Ionicons
          name={occupied ? "square" : "square-outline"}
          size={size}
          color={occupied ? colorOccupied : colorEmpty}
        />
      </Animated.View>
    );
  }
);

// ─── BasesIndicator ──────────────────────────────────────────────────────────

/**
 * Three-base diamond: 2B at top, 1B right, 3B left.
 *
 * The shape is NOT a full square — it's a triangle whose bounding box is:
 *   width  = 2 * radius + size   (1B left-edge → 3B right-edge)
 *   height = radius + size       (2B top-edge  → 1B|3B bottom-edge)
 *
 * All bases are positioned relative to the horizontal centre of the container.
 * The visual centre of 1B/3B sits at y = size/2 (top of their icons = 0).
 * 2B sits radius px above that midline, so its top-edge = -(radius - size/2).
 * The container height is exactly radius + size, with zero dead space below.
 */
export const BasesIndicator: React.FC<BasesIndicatorProps> = ({
  bases,
  isDark,
  size = 12,
}) => {
  const radius = size * .7; // distance between centre of 2B and centre of 1B/3B row

  // Container dims — tight fit around all three bases with no extra space
  const containerW = radius * 2 + size;
  const containerH = radius + size;

  const colorOccupied = isDark ? Colors.dark.limeGreen : Colors.light.green;
  const colorEmpty = isDark ? Colors.lightGray : Colors.darkGray;


  return (
    <View style={[styles.container, { width: containerW, height: containerH }]}>
      {/* 2B — top centre */}
      <PulsingBase
        occupied={bases.onSecond}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        tx={0}
        ty={-radius / 2}
      />
      {/* 1B — right */}
      <PulsingBase
        occupied={bases.onFirst}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        tx={radius}
        ty={radius / 2}
      />
      {/* 3B — left */}
      <PulsingBase
        occupied={bases.onThird}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        tx={-radius}
        ty={radius / 2}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  baseContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BasesIndicator;
