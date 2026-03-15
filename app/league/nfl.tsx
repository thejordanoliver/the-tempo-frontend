import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import DraftList from "components/League/DraftList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NFLGamesList from "components/Sports/NFL/Games/NFLGamesList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import WeekSelector from "components/Sports/NFL/WeekSelector";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useNFLGamesByWeek } from "hooks/NFLHooks/useNFLGamesByWeek";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getFootballSeasonYear } from "utils/dateUtils";
import {
  generateWeeksFromGames,
  getCurrentWeekIndexFromGames,
  NFLWeekFromGames,
} from "utils/nflWeeks";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { useHighlights } from "../../hooks/useHighlights";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

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

export default function NFLLeagueScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [draftYear, setDraftYear] = useState(
    getFootballSeasonYear().toString(),
  );
  const [standingsYear, setStandingsYear] = useState(
    getFootballSeasonYear().toString(),
  );
  const { categories, loading, error } = useSeasonLeaders(
    getFootballSeasonYear(),
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const [weeks, setWeeks] = useState<NFLWeekFromGames[]>([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("NFL");

  const selectedWeek = weeks[selectedWeekIndex] ?? null;

  const {
    games: nflGames,
    loading: nflLoading,
    refresh: refreshNFLGames,
  } = useNFLGamesByWeek({
    selectedWeek,
  });

  // --- Generate weeks dynamically once games load ---
  React.useEffect(() => {
    if (!nflGames || nflGames.length === 0) return;

    // Only generate weeks if we haven't done it yet
    if (weeks.length === 0) {
      const generatedWeeks = generateWeeksFromGames(nflGames);
      setWeeks(generatedWeeks);

      // Set current week on first load
      const currentWeekIndex = getCurrentWeekIndexFromGames(generatedWeeks);
      setSelectedWeekIndex(currentWeekIndex);
    }
  }, [nflGames, weeks.length]);

  // --- Load favorites from AsyncStorage ---
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
    }, []),
  );

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="NFL"
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

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNFLGames();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };



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
          <View key="scores" style={styles.contentArea}>
            <WeekSelector
              weeks={weeks}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              monthTextStyle={styles.monthText}
              monthTextSelectedStyle={styles.monthTextSelected}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              <NFLGamesList
                games={nflGames}
                loading={nflLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                scrollEnabled={false}
              />
            </ScrollView>
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            ></ScrollView>
          </View>

          {/* STANDINGS */}
          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league="NFL"
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={"NFL"}
            />
          </View>

          {/* DRAFT */}
          <View key="draft" style={styles.contentArea}>
            <DraftList
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="nfl"
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league="NFL" />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league="NFL" />
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
