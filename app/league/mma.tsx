import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LeagueForum from "components/Forum/LeagueForum";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import EventSelector from "components/Sports/MMA/EventSelector";
import MMAGamesList from "components/Sports/MMA/Games/MMAGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useSeasonFights } from "hooks/MMAHooks/useSeasonFights";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import { useLayoutEffect, useRef, useState } from "react";
import { useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
export default function UFCLeagueScreen() {
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);
  const navigation = useNavigation();
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const { events, loading, refreshing, refreshFights, error } =
    useSeasonFights();
  const selectedEvent = events[selectedEventIndex];
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("MMA");
  const pagerRef = useRef<PagerView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="MMA"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible]);

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);
          const index = tabs.indexOf(tab);
          pagerRef.current?.setPage(index);
        }}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(tabs[index]);
          }}
        >
          {/* SCORES */}
          <View key="fights">
            <>
              <EventSelector
                events={events}
                selectedEventIndex={selectedEventIndex}
                onSelectEvent={setSelectedEventIndex}
                textStyle={styles.eventText}
                textSelectedStyle={styles.eventTextSelected}
              />

              <MMAGamesList
                games={[
                  ...(selectedEvent?.mainCard ?? []),
                  ...(selectedEvent?.prelims ?? []),
                ]}
                loading={loading}
                error={error}
                refreshing={refreshing}
                onRefresh={refreshFights}
              />
            </>
          </View>

          {/* FORUM */}
          <View key="forum">
            <LeagueForum league="MMA" />
          </View>
        </PagerView>
      </View>

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
