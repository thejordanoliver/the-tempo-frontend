import { StyleProp, ViewStyle } from "react-native";

import SkeletonBlock from "./SkeletonBlock";

type SkeletonCircleProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function SkeletonCircle({
  size = 40,
  style,
}: SkeletonCircleProps) {
  return (
    <SkeletonBlock
      width={size}
      height={size}
      radius={size / 2}
      style={style}
    />
  );
}
