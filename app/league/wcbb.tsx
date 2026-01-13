// app/league/cbb.tsx (WOMEN)

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
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { goBack } from "expo-router/build/global-state/routing";
import { useRouter } from "expo-router";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueNews } from "hooks/useLeagueNews";
import * as React from "react";
import {
  filterCBBGames,
  useAPTop25,
} from "utils/CBBUtils/cbbGameUtils";
import {
  RefreshControl,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";
import { getScoresStyles } from "styles/LeagueStyles";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import TabBar from "../../components/TabBar";
import { useHighlights } from "../../hooks/useHighlights";
import { getTeamInfo } from "constants/teamsCBB";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/* =====================================================
   STATS TAB
===================================================== */

function StatsTabContent() {
  const { categories, loading, error } = useSeasonLeaders(2025, "WCBB");

  return (
    <SeasonLeadersList
      loading={loading}
      error={error}
      categories={categories}
      league="WCBB"
    />
  );
}

/* =====================================================
   SCREEN
===================================================== */

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

export default function WCBBLeagueScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  const conferenceModalRef = React.useRef<ConferenceListModalRef>(null);

  const [selectedConference, setSelectedConference] =
    React.useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<
    "scores" | "news" | "standings" | "stats" | "forum"
  >("scores");
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCalendarModal, setShowCalendarModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const {
    games: seasonGames,
    loading: cbbloading,
    refreshCBBGames,
  } = useCBBSeasonGames({ isWomen: true });

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

  /* -------------------------------
     WOMEN’S AP TOP 25 (FIXED)
  -------------------------------- */
  const apTop25 = useAPTop25("423");
  const top25Teams = React.useMemo(
    () => apTop25.map((t) => String(t?.id)),
    [apTop25]
  );

  /* -------------------------------
     NEWS / HIGHLIGHTS
  -------------------------------- */
  const { news: cbbNews, loading: cfbLoading } = useLeagueNews("WCBB");
  const { highlights } = useHighlights("wcbb", "", 10);

  /* -------------------------------
     HEADER
  -------------------------------- */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="WCBB"
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  /* -------------------------------
     FILTERED GAMES (FIXED)
  -------------------------------- */
const filteredGames = React.useMemo(() => {
  const gamesForDate = seasonGames.filter((game) =>
    dayjs.utc(game.date).local().isSame(dayjs(selectedDate), "day")
  );

  let result = gamesForDate;

 if (selectedConference === "Top 25") {
  result = gamesForDate.filter((game) => {
     const home = getTeamInfo(String(game.teams.home.id), true);
    const away = getTeamInfo(String(game.teams.away.id), true);
    const homeESPN = home?.espnID;
    const awayESPN = away?.espnID;

    return (
      (homeESPN && top25Teams.includes(String(homeESPN))) ||
      (awayESPN && top25Teams.includes(String(awayESPN)))
    );
  });
}
 else if (selectedConference) {
    result = filterCBBGames({
      games: gamesForDate,
      selectedConference,
      top25Teams,
    });
  }

  return result;
}, [seasonGames, selectedDate, selectedConference, top25Teams]);

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
  
  /* -------------------------------
     RENDER
  -------------------------------- */
  return (
    <>
      <View style={styles.container}>
        <TabBar
          tabs={["scores", "news", "standings", "stats", "forum"]}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <DateNavigator
                selectedDate={selectedDate}
                onChangeDate={(d) =>
                  setSelectedDate(
                    dayjs(selectedDate).add(d, "day").toDate()
                  )
                }
                onOpenCalendar={() => setShowCalendarModal(true)}
                isDark={isDark}
              />

              <CBBGamesList
                games={filteredGames}
                loading={cbbloading}
                refreshing={refreshing}
                onRefresh={refreshCBBGames}
                scrollEnabled={false}
                isWomen
              />
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshCBBGames}
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

          {selectedTab === "standings" &&
            (selectedConference === "Top 25" ? (
              <CBBStandingsList league="423" />
            ) : (
              <CBBConferenceStandingsList
                selectedConference={selectedConference}
                women
              />
            ))}

          {selectedTab === "stats" && <StatsTabContent />}
          {selectedTab === "forum" && <LeagueForum league="WCBB" />}
        </View>
      </View>

      <ConferenceListModal
        ref={conferenceModalRef}
        league="cbb"
        onSelect={(conf) => setSelectedConference(conf ?? "Top 25")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
      />
    </>
  );
}
