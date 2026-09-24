import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type WidgetCarouselProps<Item> = {
  items: readonly Item[];
  initialWidth: number;
  height?: number;
  isDark: boolean;
  renderItem: (item: Item, index: number) => ReactNode;
  keyExtractor: (item: Item, index: number) => string;
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
  disabled?: boolean;
  showDots?: boolean;
  style?: StyleProp<ViewStyle>;
  pageStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: (pageIndex: number, pageCount: number) => string;
  onPageChange?: (pageIndex: number) => void;
};
