import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

type BasesProps = {
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  size?: number;
  isDark: boolean;
};

const PulsingBase = ({
  occupied,
  size,
  colorOccupied,
  colorEmpty,
  style,
}: {
  occupied: boolean;
  size: number;
  colorOccupied: string;
  colorEmpty: string;
  style: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevOccupied = useRef<boolean>(occupied);

  useEffect(() => {
    // Detect runner just reached base (false -> true)
    const justOccupied = !prevOccupied.current && occupied;

    if (justOccupied) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }

    prevOccupied.current = occupied;
  }, [occupied]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          transform: [
            { rotate: "45deg" }, // rotate container for real diamond
            { scale },
          ],
        },
        style,
      ]}
    >
      <Ionicons
        name={occupied ? "square" : "square-outline"}
        size={size}
        color={occupied ? colorOccupied : colorEmpty}
      />
    </Animated.View>
  );
};

export const BasesIndicator: React.FC<BasesProps> = ({
  bases,
  isDark,
  size = 16,
}) => {
  const containerSize = 24;
  const center = containerSize / 2;
  const offset = 8;

  const colorOccupied = isDark ? Colors.dark.limeGreen : Colors.light.green;
  const colorEmpty = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        alignSelf: "center",
        position: "relative",
      }}
    >
      {/* Second Base (Top) */}
      <PulsingBase
        occupied={bases.second}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        style={{
          top: center - offset - size / 2,
          left: center - size / 2,
        }}
      />

      {/* First Base (Right) */}
      <PulsingBase
        occupied={bases.first}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        style={{
          top: center - size / 2,
          left: center + offset - size / 2,
        }}
      />

      {/* Third Base (Left) */}
      <PulsingBase
        occupied={bases.third}
        size={size}
        colorOccupied={colorOccupied}
        colorEmpty={colorEmpty}
        style={{
          top: center - size / 2,
          left: center - offset - size / 2,
        }}
      />
    </View>
  );
};

export default BasesIndicator;
