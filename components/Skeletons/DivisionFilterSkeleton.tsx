import SelectorSkeleton, { SelectorSkeletonProps } from "./SelectorSkeleton";

export default function DivisionFilterSkeleton({ itemCount = 3, itemWidth = 100, ...props }: SelectorSkeletonProps) {
  return <SelectorSkeleton {...props} itemCount={itemCount} itemWidth={itemWidth} />;
}
