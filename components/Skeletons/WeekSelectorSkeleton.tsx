import { DATE_SELECTOR_ITEM_HEIGHT } from "constants/dateSelectorConstants";
import SelectorSkeleton, { SelectorSkeletonProps } from "./SelectorSkeleton";

export default function WeekSelectorSkeleton({
  itemCount = 10,
  itemWidth = 100,
  itemHeight = DATE_SELECTOR_ITEM_HEIGHT,
  ...props
}: SelectorSkeletonProps) {
  return (
    <SelectorSkeleton
      {...props}
      itemCount={itemCount}
      itemWidth={itemWidth}
      itemHeight={itemHeight}
    />
  );
}
