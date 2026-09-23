import CustomActivityIndicator from "components/CustomActivityIndicator";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import type { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { Children, isValidElement, useRef, type ReactNode } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";

type Props = {
  ready: boolean;
  screen: ReturnType<typeof useTeamDetailScreen>;
  children: ReactNode;
  footer?: ReactNode;
};

export default function TeamDetailScreen({ ready, screen, children, footer }: Props) {
  const pagerRef = useRef<PagerView>(null);
  const handleTabPress = (tab: string) => {
    const index = screen.tabs.indexOf(tab);
    if (index < 0) return;
    screen.handleTabPress(tab);
    pagerRef.current?.setPage(index);
  };

  if (!ready) {
    return (
      <View style={teamDetailStyles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // Route children retain their existing keys and markup. Only configured tabs
  // become pager pages, so an extra legacy child cannot shift tab indices.
  const keyedChildren = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (isValidElement(child) && typeof child.key === "string") {
      keyedChildren.set(child.key, child);
    }
  });

  return (
    <View style={teamDetailStyles.container}>
      <MainScrollTabBar
        tabs={screen.tabs}
        selected={screen.selectedTab}
        onTabPress={handleTabPress}
        isDark={screen.isDark}
        scrollProgress={screen.scrollProgress}
      />
      <PagerView
        ref={pagerRef}
        style={teamDetailStyles.contentArea}
        initialPage={Math.max(0, screen.tabs.indexOf(screen.selectedTab))}
        onPageScroll={screen.handlePageScroll}
        onPageSelected={(event) => screen.handlePageChange(event.nativeEvent.position)}
      >
        {screen.tabs.map((tab) => keyedChildren.get(tab) ?? (
          <View key={tab} style={teamDetailStyles.contentArea} />
        ))}
      </PagerView>
      {footer}
    </View>
  );
}
