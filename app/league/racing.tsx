import MMAChampionsList from "@/components/Sports/MMA/Champions/MMAChampionsList";
import EventSelector, {
  getDefaultUFCEventIndex,
} from "@/components/Sports/MMA/EventSelector";
import { useLeagueCalendar } from "@/hooks/LeagueHooks/useLeagueCalendar";
import { useRacingEvents } from "@/hooks/RacingHooks/useRacingEvents";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { LEAGUE_TABS, League } from "utils/tabs";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import LeagueForum from "../../components/Forum/LeagueForum";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import NewsList from "../../components/News/NewsList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";

function isLeague(value: unknown): value is League {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(LEAGUE_TABS, value) &&
    Array.isArray(LEAGUE_TABS[value as League])
  );
}

function normalizeLeagueParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return String(rawValue || "")
    .trim()
    .toUpperCase();
}

export default function RacingLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();
  const normalizedParamLeague = normalizeLeagueParam(params.league);
  const leagueLabel = params.leagueLabel;
  const league: League = isLeague(normalizedParamLeague)
    ? normalizedParamLeague
    : "F1";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const navigation = useNavigation();
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null,
  );

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const { calendar } = useLeagueCalendar(normalizedParamLeague, "racing");

  const sortedCalendar = useMemo(() => {
    return [...(calendar ?? [])].sort((a, b) => {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();

      return aDate - bDate;
    });
  }, [calendar]);

  const defaultEventIndex = useMemo(() => {
    return getDefaultUFCEventIndex(sortedCalendar);
  }, [sortedCalendar]);

  const safeSelectedEventIndex = useMemo(() => {
    if (!sortedCalendar.length) return 0;

    const rawIndex = selectedEventIndex ?? defaultEventIndex;

    return Math.min(Math.max(rawIndex, 0), sortedCalendar.length - 1);
  }, [selectedEventIndex, defaultEventIndex, sortedCalendar.length]);

  const selectedEvent = sortedCalendar[safeSelectedEventIndex] ?? null;
  const selectedEventDate = selectedEvent?.startDate ?? null;

  const {
    data,
    loading,
    refreshing: refreshingGames,
    refreshGames,
    error,
  } = useRacingEvents({
    date: selectedEventDate,
    league: league,
    enabled: Boolean(selectedEventDate),
  });

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(normalizedParamLeague, 10);

  const openLeagueModal = useCallback(() => {
    setLeagueModalVisible(true);
    sportsModalRef.current?.present();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={leagueLabel}
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={openLeagueModal}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible, leagueLabel, openLeagueModal]);

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);

          const index = tabs.indexOf(tab);

          if (index >= 0) {
            pagerRef.current?.setPage(index);
          }
        }}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            const nextTab = tabs[index];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          <View key="fights" style={styles.contentArea}>
            <EventSelector
              events={sortedCalendar}
              loading={!sortedCalendar.length}
              selectedEventIndex={safeSelectedEventIndex}
              onSelectEvent={setSelectedEventIndex}
              isDark={isDark}
            />
          </View>

          <View key="news" style={styles.contentArea}>
            <NewsList
              items={articles}
              loading={newsLoading}
              error={newsError}
              refreshing={refreshingNews}
              onRefresh={refreshNews}
              isDark={isDark}
            />
          </View>

          <View key="champions" style={styles.contentArea}>
            <MMAChampionsList />
          </View>

          <View key="forum" style={styles.contentArea}>
            <LeagueForum league={league} />
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
