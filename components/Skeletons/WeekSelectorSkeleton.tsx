import SelectorSkeleton, { SelectorSkeletonProps } from "./SelectorSkeleton";

export default function WeekSelectorSkeleton({ itemCount = 10, itemWidth = 100, ...props }: SelectorSkeletonProps) {
  return <SelectorSkeleton {...props} itemCount={itemCount} itemWidth={itemWidth} />;
}
