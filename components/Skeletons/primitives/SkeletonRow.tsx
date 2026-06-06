import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type SkeletonRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  alignItems?: ViewStyle["alignItems"];
};

export default function SkeletonRow({
  children,
  style,
  gap,
  alignItems,
}: SkeletonRowProps) {
  return (
    <View style={[{ flexDirection: "row", gap, alignItems }, style]}>
      {children}
    </View>
  );
}
