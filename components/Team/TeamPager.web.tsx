import { forwardRef } from "react";
import { View } from "react-native";
import type PagerView from "react-native-pager-view";
import type { PagerViewProps } from "react-native-pager-view";

// TeamDetailScreen renders its tab panels on web without loading native code.
export default forwardRef<PagerView, PagerViewProps>(function TeamPager(
  { children, style },
  _ref,
) {
  return <View style={style}>{children}</View>;
});
