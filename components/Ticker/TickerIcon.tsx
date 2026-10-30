import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type TickerIconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  name: TickerIconName;
  color: string;
  size?: number;
};

// Labels and accessibility roles carry meaning; these icons are decorative.
export default function TickerIcon({ name, color, size = 20 }: Props) {
  return (
    <Ionicons
      name={name}
      color={color}
      size={size}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
