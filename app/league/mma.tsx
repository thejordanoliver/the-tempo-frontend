import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LeagueForum from "components/Forum/LeagueForum";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import WeekSelector from "components/League/WeekSelector";
import NewsList from "components/News/NewsList";
import MMAChampionsList from "components/Sports/MMA/Champions/MMAChampionsList";
import MMAGamesList from "components/Sports/MMA/Games/MMAGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useRouter } from "expo-router";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useSeasonFights } from "hooks/MMAHooks/useSeasonFights";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";

const getComparableValue = (value: unknown) => {
  if (value === null || value === undefined) return "";

  return String(value).trim().toLowerCase();
};

const getEventIdFromFightEvent = (event: any) => {
  return (
    event?.eventId ??
    event?.id ??
    event?.espnId ??
    event?.espn_id ??
    event?.event_id ??
    null
  );
};

const getEventLabelFromFightEvent = (event: any) => {
  return (
    event?.label ??
    event?.name ??
    event?.title ??
    event?.displayName ??
    event?.shortName ??
    ""
  );
};

export default function UFCLeagueScreen() {
  const league = "MMA" as const;

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const navigation = useNavigation();
  const router = useRouter();

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);

  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [refreshingNews, setRefreshingNews] = useState(false);

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("MMA");

  const {
    calendar: mmaCalendar,
    loading: calendarLoading,
  } = useLeagueCalendar(league, "mma");

  const {
    events,
    loading,
    refreshing: refreshingFights,
    refreshFights,
    error,
  } = useSeasonFights();

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, "MMA");

  useEffect(() => {
    if (mmaCalendar.length === 0) {
      if (selectedEventIndex !== 0) {
        setSelectedEventIndex(0);
      }

      return;
    }

    if (selectedEventIndex > mmaCalendar.length - 1) {
      setSelectedEventIndex(mmaCalendar.length - 1);
    }
  }, [mmaCalendar.length, selectedEventIndex]);

  const selectedCalendarEvent = useMemo(() => {
    if (mmaCalendar.length === 0) return null;

    return mmaCalendar[selectedEventIndex] ?? mmaCalendar[0] ?? null;
  }, [mmaCalendar, selectedEventIndex]);

  const selectedFightEvent = useMemo(() => {
    if (events.length === 0) return null;

    if (!selectedCalendarEvent) {
      return events[selectedEventIndex] ?? null;
    }

    const selectedCalendarEventId = getComparableValue(
      selectedCalendarEvent.eventId,
    );

    const selectedCalendarLabel = getComparableValue(
      selectedCalendarEvent.label,
    );

    const matchedById =
      selectedCalendarEventId.length > 0
        ? events.find((event: any) => {
            const eventId = getComparableValue(getEventIdFromFightEvent(event));

            return eventId.length > 0 && eventId === selectedCalendarEventId;
          })
        : null;

    if (matchedById) {
      return matchedById;
    }

    const matchedByLabel =
      selectedCalendarLabel.length > 0
        ? events.find((event: any) => {
            const eventLabel = getComparableValue(
              getEventLabelFromFightEvent(event),
            );

            return (
              eventLabel.length > 0 &&
              (eventLabel === selectedCalendarLabel ||
                selectedCalendarLabel.includes(eventLabel) ||
                eventLabel.includes(selectedCalendarLabel))
            );
          })
        : null;

    if (matchedByLabel) {
      return matchedByLabel;
    }

    return events[selectedEventIndex] ?? null;
  }, [events, selectedCalendarEvent, selectedEventIndex]);

  const selectedEventGames = useMemo(
    () => [
      ...(selectedFightEvent?.mainCard ?? []),
      ...(selectedFightEvent?.prelims ?? []),
    ],
    [selectedFightEvent],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshingNews(true);

    try {
      await refreshFights();
    } catch (error) {
      console.warn("Failed to refresh MMA screen:", error);
    } finally {
      setRefreshingNews(false);
    }
  }, [refreshFights]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={league}
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, router, leagueModalVisible]);

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
            <WeekSelector
              mode="mma"
              events={mmaCalendar}
              selectedEventIndex={selectedEventIndex}
              onSelectEvent={setSelectedEventIndex}
              isDark={isDark}
              loading={calendarLoading}
            />

            <MMAGamesList
              games={selectedEventGames}
              loading={loading}
              error={error}
              refreshing={refreshingFights}
              onRefresh={refreshFights}
            />
          </View>

          <View key="news" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshingNews}
                  onRefresh={handleRefresh}
                />
              }
            >
              <NewsList
                items={articles}
                isDark={isDark}
                loading={newsLoading}
                error={newsError}
                refreshing={refreshingNews}
                onRefresh={handleRefresh}
              />
            </ScrollView>
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