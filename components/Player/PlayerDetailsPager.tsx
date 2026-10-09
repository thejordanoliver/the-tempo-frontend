import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { usePagerTabScrollProgress } from "hooks/usePagerTabScrollProgress";
import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import type { PageScrollStateChangedNativeEvent, PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

type Page = { label: string; content: ReactNode };
type Props = { overview: ReactNode; pages: Page[]; isDark: boolean };

// Keep table rendering out of tab-selection and pager-height updates.
const PageContent = memo(function PageContent({
  page,
  onMeasure,
}: {
  page: Page;
  onMeasure: (label: string, height: number) => void;
}) {
  return (
    <View
      style={styles.pageContent}
      onLayout={event => onMeasure(page.label, event.nativeEvent.layout.height)}
    >
      {page.content}
    </View>
  );
});

export default function PlayerDetailsPager({ overview, pages, isDark }: Props) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const pagerRef = useRef<PagerView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const selectedPage = useRef(0);
  const scrollState = useRef("idle");
  const scrollOffset = useRef(0);
  const tabBarOffset = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const settledPage = useRef(0);
  const pageHeights = useRef(new Map<string, number>());
  const [pagerHeight, setPagerHeight] = useState(400);
  const { scrollProgress, handlePageScroll, syncPageScrollProgress } =
    usePagerTabScrollProgress();
  const tabs = useMemo(() => pages.map(page => page.label), [pages]);

  const measurePage = useCallback((label: string, height: number) => {
    const measuredHeight = Math.ceil(height);
    pageHeights.current.set(label, measuredHeight);
    if (scrollState.current === "idle" && label === tabs[selectedPage.current]) {
      setPagerHeight(Math.max(measuredHeight, 240));
    }
  }, [tabs]);

  const settlePage = useCallback((index: number) => {
    // Switching from a long table to a short page must not let native scrolling
    // clamp to an arbitrary position when the pager's height shrinks.
    if (index !== settledPage.current && scrollOffset.current > tabBarOffset.current) {
      scrollRef.current?.scrollTo({ y: tabBarOffset.current, animated: false });
    }
    settledPage.current = index;
    setPagerHeight(Math.max(pageHeights.current.get(tabs[index]) ?? 400, 240));
    syncPageScrollProgress(index);
  }, [tabs, syncPageScrollProgress]);

  const handleTabPress = useCallback((tab: string) => {
    const index = tabs.indexOf(tab);
    if (index < 0 || index === selectedPage.current) return;
    scrollState.current = "settling";
    selectedPage.current = index;
    setSelectedIndex(index);
    pagerRef.current?.setPage(index);
  }, [tabs]);

  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    const index = event.nativeEvent.position;
    selectedPage.current = index;
    setSelectedIndex(index);
    if (scrollState.current === "idle") settlePage(index);
  }, [settlePage]);

  const handleScrollStateChanged = useCallback((event: PageScrollStateChangedNativeEvent) => {
    scrollState.current = event.nativeEvent.pageScrollState;
    if (scrollState.current === "idle") settlePage(selectedPage.current);
  }, [settlePage]);

  return (
    <ScrollView
      ref={scrollRef}
      stickyHeaderIndices={[1]}
      contentContainerStyle={navigationContentStyle(styles.content)}
      directionalLockEnabled
      scrollEventThrottle={16}
      onScroll={event => { scrollOffset.current = event.nativeEvent.contentOffset.y; }}
    >
      <View style={[playerScreenStyles.contentContainerStyle, styles.overview]}>
        {overview}
      </View>
      <View
        onLayout={event => { tabBarOffset.current = event.nativeEvent.layout.y; }}
        style={[styles.tabBar, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      >
        <MainScrollTabBar
          tabs={tabs}
          selected={tabs[selectedIndex]}
          onTabPress={handleTabPress}
          isDark={isDark}
          scrollProgress={scrollProgress}
        />
      </View>
      <PagerView
        ref={pagerRef}
        style={{ height: pagerHeight }}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
        onPageScrollStateChanged={handleScrollStateChanged}
      >
        {pages.map(page => (
          <View key={page.label} collapsable={false} style={styles.page}>
            <PageContent page={page} onMeasure={measurePage} />
          </View>
        ))}
      </PagerView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  overview: { paddingBottom: 0 },
  tabBar: { marginTop: 16 },
  page: { flex: 1 },
  pageContent: { paddingHorizontal: 12, paddingBottom: 16 },
});
