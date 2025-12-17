// app/league/cbb.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import CBBGamesList from "components/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/CBB/Standings/CBBConferenceStandingsList";
import { CBBStandingsList } from "components/CBB/Standings/CBBStandingsList";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/CFB/ConferenceListModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import SeasonLeadersList from "components/NFL/SeasonLeaderList";
import { Colors } from "constants/Colors";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueNews } from "hooks/useLeagueNews";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles";
import { filterCBBGames, useAPTop25 } from "utils/CBBUtils/cbbGameUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import TabBar from "../../components/TabBar";
import { useHighlights } from "../../hooks/useHighlights";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

function StatsTabContent() {
  const { categories, loading, error } = useSeasonLeaders(2025, "CBB");

  return (
    <SeasonLeadersList
      loading={loading}
      error={error}
      categories={categories}
      league={"CBB"}
    />
  );
}
type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};

type HighlightItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

type CombinedItem =
  | (NewsItem & { itemType: "news" })
  | (HighlightItem & { itemType: "highlight" });

export default function CBBLeagueScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const { rankings } = useCBBRankings();

  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [selectedConference, setSelectedConference] =
    useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    games: seasonGames,
    loading: cbbloading,
    refreshCBBGames,
  } = useCBBSeasonGames();

  const [selectedTab, setSelectedTab] = useState<
    "scores" | "news" | "standings" | "stats" | "forum"
  >("scores");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const tabs = ["scores", "news", "standings", "stats", "forum"] as const;

  // --- News & Highlights ---
  const { news: cbbNews, loading: cfbLoading } = useLeagueNews("CBB");
  const { highlights } = useHighlights("cbb", "", 10);

  // --- AP Top 25 from rankings ---
  const apTop25 = useAPTop25();

  const top25Teams = React.useMemo(() => {
    return apTop25.map((t) => t.name);
  }, [apTop25]);

  // --- Load favorites ---
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const stored = await AsyncStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (error) {
          console.warn("Failed to load favorites:", error);
        }
      };
      loadFavorites();
    }, [])
  );

  // --- Header with rotating chevron ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="CBB"
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference ?? undefined}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshCBBGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const changeDateByDays = (days: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  // --- Calendar marked dates ---
  const markDates = (gamesArray: any[]) =>
    gamesArray.reduce((acc, game) => {
      const d = dayjs.utc(game).local();
      const iso = d.format("YYYY-MM-DD");
      acc[iso] = {
        marked: true,
        dotColor: isDark ? Colors.white : Colors.black,
      };
      return acc;
    }, {});

  const filteredGames = React.useMemo(() => {
    const gamesForDate = seasonGames.filter((game) =>
      dayjs.utc(game.date).local().isSame(dayjs(selectedDate), "day")
    );

    // Filter based on selected conference or Top 25
    let result = gamesForDate;
    if (selectedConference === "Top 25") {
      result = gamesForDate.filter(
        (game) =>
          top25Teams.includes(game.teams.home.name) ||
          top25Teams.includes(game.teams.away.name)
      );
    } else if (selectedConference) {
      result = filterCBBGames({
        games: gamesForDate,
        selectedConference,
        top25Teams,
      });
    }

    return result;
  }, [seasonGames, selectedDate, selectedConference, top25Teams]);

  const gamesForDate = seasonGames.filter((game) =>
    dayjs(game.date).isSame(dayjs(selectedDate), "day")
  );

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = cbbNews.map((item) => ({
      ...item,
      itemType: "news",
      publishedAt: item.publishedAt ?? item.date ?? new Date().toISOString(),
    }));
    const taggedHighlights: CombinedItem[] = highlights.map((item) => ({
      ...item,
      itemType: "highlight",
      publishedAt: item.publishedAt ?? new Date().toISOString(),
    }));
    const combined = [...taggedNews, ...taggedHighlights];
    combined.sort(
      (a, b) =>
        new Date(b.publishedAt || new Date().toISOString()).getTime() -
        new Date(a.publishedAt || new Date().toISOString()).getTime()
    );
    return combined;
  }, [cbbNews, highlights]);

  return (
    <>
      <View style={styles.container}>
        <TabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <DateNavigator
                selectedDate={selectedDate}
                onChangeDate={changeDateByDays}
                onOpenCalendar={() => setShowCalendarModal(true)}
                isDark={isDark}
              />
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                <CBBGamesList
                  games={filteredGames}
                  loading={cbbloading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                />
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <NewsHighlightsList
                items={combinedNewsAndHighlights}
                loading={cfbLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          )}

          {selectedTab === "standings" && (
            <>
              {selectedConference === "Top 25" || !selectedConference ? (
                <CBBStandingsList />
              ) : (
                <CBBConferenceStandingsList
                  selectedConference={selectedConference}
                />
              )}
            </>
          )}

          {selectedTab === "stats" && <StatsTabContent />}
          {selectedTab === "forum" && <LeagueForum league="CBB" />}
        </View>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          setSelectedDate(new Date(year, month - 1, day));
          setShowCalendarModal(false);
        }}
        markedDates={{
          ...markDates(seasonGames.map((g) => g.date)),
        }}
      />

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf ?? "")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        league="cbb"
      />
    </>
  );
}
