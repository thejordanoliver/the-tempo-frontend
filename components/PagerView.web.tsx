import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View, type NativeSyntheticEvent } from "react-native";
import type NativePagerView from "react-native-pager-view";
import type { PagerViewProps } from "react-native-pager-view";

export type * from "react-native-pager-view";

type PagerHandle = Pick<
  NativePagerView,
  "setPage" | "setPageWithoutAnimation" | "setScrollEnabled"
>;

const event = <T,>(nativeEvent: T) =>
  ({ nativeEvent }) as NativeSyntheticEvent<T>;

// Keep native pager code out of the web bundle while retaining the same tab
// commands, page events and mounted panels used by the screens on mobile.
export default forwardRef<PagerHandle, PagerViewProps>(function PagerView(
  {
    children,
    initialPage = 0,
    scrollEnabled = true,
    orientation = "horizontal",
    layoutDirection = "ltr",
    onPageSelected,
    onPageScroll,
    onPageScrollStateChanged,
    style,
    pageMargin: _pageMargin,
    offscreenPageLimit: _offscreenPageLimit,
    overScrollMode: _overScrollMode,
    overdrag: _overdrag,
    keyboardDismissMode: _keyboardDismissMode,
    ...viewProps
  },
  ref,
) {
  const pages = Children.toArray(children);
  const pageRef = useRef(initialPage);
  const [selectedPage, setSelectedPage] = useState(initialPage);
  const enabled = useRef(scrollEnabled);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const callbacks = useRef({
    onPageSelected,
    onPageScroll,
    onPageScrollStateChanged,
  });
  callbacks.current = {
    onPageSelected,
    onPageScroll,
    onPageScrollStateChanged,
  };
  const clamp = useCallback(
    (page: number) =>
      Math.max(0, Math.min(pages.length - 1, Math.floor(page) || 0)),
    [pages.length],
  );

  const selectPage = useCallback(
    (page: number) => {
      const position = clamp(page);
      pageRef.current = position;
      setSelectedPage(position);
      const handlers = callbacks.current;
      handlers.onPageScrollStateChanged?.(
        event({ pageScrollState: "settling" }),
      );
      handlers.onPageScroll?.(event({ position, offset: 0 }));
      handlers.onPageSelected?.(event({ position }));
      handlers.onPageScrollStateChanged?.(event({ pageScrollState: "idle" }));
    },
    [clamp],
  );

  useEffect(() => {
    enabled.current = scrollEnabled;
  }, [scrollEnabled]);
  useEffect(() => {
    selectPage(pageRef.current);
  }, [selectPage]);
  useImperativeHandle(
    ref,
    () => ({
      setPage: selectPage,
      setPageWithoutAnimation: selectPage,
      setScrollEnabled: (value) => {
        enabled.current = value;
      },
    }),
    [selectPage],
  );

  return (
    <View
      {...viewProps}
      style={[{ minWidth: 0, minHeight: 0 }, style]}
      onTouchStart={(e) => {
        touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        viewProps.onTouchStart?.(e);
      }}
      onTouchCancel={(e) => {
        touchStart.current = null;
        viewProps.onTouchCancel?.(e);
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start && enabled.current) {
          const dx = e.nativeEvent.pageX - start.x;
          const dy = e.nativeEvent.pageY - start.y;
          const distance = orientation === "vertical" ? dy : dx;
          const crossDistance = orientation === "vertical" ? dx : dy;
          if (
            Math.abs(distance) > 60 &&
            Math.abs(distance) > Math.abs(crossDistance) * 1.5
          ) {
            const direction =
              orientation === "horizontal" && layoutDirection === "rtl"
                ? -1
                : 1;
            selectPage(pageRef.current + (distance < 0 ? 1 : -1) * direction);
          }
        }
        viewProps.onTouchEnd?.(e);
      }}
    >
      {pages.map((page, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            minHeight: 0,
            display: index === clamp(selectedPage) ? "flex" : "none",
          }}
          accessibilityElementsHidden={index !== clamp(selectedPage)}
          importantForAccessibility={
            index === clamp(selectedPage) ? "auto" : "no-hide-descendants"
          }
        >
          {page}
        </View>
      ))}
    </View>
  );
});
