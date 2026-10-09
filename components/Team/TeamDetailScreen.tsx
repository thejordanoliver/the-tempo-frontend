import TeamInfoModal from "components/Sports/Basketball/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, globalStyles } from "constants/styles";
import type { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { Children, isValidElement, useRef, type ReactNode } from "react";
import { Platform, Text, View } from "react-native";
import type PagerView from "react-native-pager-view";
import TeamPager from "components/Team/TeamPager";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";

type Props = {
  ready: boolean;
  screen: ReturnType<typeof useTeamDetailScreen>;
  children: ReactNode;
  footer?: ReactNode;
};

export default function TeamDetailScreen({
  ready,
  screen,
  children,
  footer,
}: Props) {
  const pagerRef = useRef<PagerView>(null);
  const global = globalStyles(screen.isDark);
  const background = {
    backgroundColor: screen.isDark ? Colors.dark.background : Colors.light.background,
  };
  const handleTabPress = (tab: string) => {
    const index = screen.tabs.indexOf(tab);
    if (index < 0) return;
    screen.handleTabPress(tab);
    if (Platform.OS === "web") screen.handlePageChange(index);
    pagerRef.current?.setPage(index);
  };

  if (!ready) {
    return (
      <View style={[global.emptyContainer, background]}>
        <Text style={global.emptyTitle}>Team unavailable</Text>
        <Text style={global.emptySubText}>This team could not be found.</Text>
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
    <View style={[TeamDetailStyles.container, background]}>
      <MainScrollTabBar
        tabs={screen.tabs}
        selected={screen.selectedTab}
        onTabPress={handleTabPress}
        isDark={screen.isDark}
        scrollProgress={screen.scrollProgress}
      />
      {Platform.OS === "web" ? (
        <View style={TeamDetailStyles.contentArea}>
          {screen.tabs.map((tab) => (
            <View
              key={tab}
              style={[
                TeamDetailStyles.contentArea,
                { display: screen.selectedTab === tab ? "flex" : "none" },
              ]}
            >
              {(screen.selectedTab === tab || screen.hasVisitedTab(tab)) && keyedChildren.get(tab)}
            </View>
          ))}
        </View>
      ) : <TeamPager
        ref={pagerRef}
        style={TeamDetailStyles.contentArea}
        initialPage={Math.max(0, screen.tabs.indexOf(screen.selectedTab))}
        onPageScroll={screen.handlePageScroll}
        onPageSelected={(event) =>
          screen.handlePageChange(event.nativeEvent.position)
        }
      >
        {screen.tabs.map((tab) => (
          <View key={tab} collapsable={false} style={TeamDetailStyles.contentArea}>
            {(screen.selectedTab === tab || screen.hasVisitedTab(tab)) && keyedChildren.get(tab)}
          </View>
        ))}
      </TeamPager>}
      {screen.teamInfo.enabled && (
        <TeamInfoModal
          {...screen.teamInfo}
          teamDetails={screen.teamDetails}
          loading={screen.teamDetailsLoading}
          error={screen.teamDetailsError}
          onRetry={screen.refreshTeamDetails}
          visible={screen.modalVisible}
          onClose={() => screen.setModalVisible(false)}
        />
      )}
      {footer}
    </View>
  );
}
