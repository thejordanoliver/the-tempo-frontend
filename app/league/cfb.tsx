import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import { Bracket } from "components/Sports/CFB/Bracket/Bracket";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/Sports/CFB/ConferenceListModal";
import CFBGamesList from "components/Sports/CFB/Games/CFBGamesList";
import RecruitsList from "components/Sports/CFB/Recruiting/RecruitsList";
import { CFBConferenceStandingsList } from "components/Sports/CFB/Standings/CFBConferenceStandingsList";
import { CFBStandingsList } from "components/Sports/CFB/Standings/CFBStandingsList";
import WeekSelector from "components/Sports/CFB/WeekSelector";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGamesByWeek } from "hooks/CFBHooks/useCFBGamesByWeek";
import { useCFPBracket } from "hooks/CFBHooks/useCFPBracket";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueNews } from "hooks/useLeagueNews";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { CFBGame } from "types/cfb";
import { filterCFBGames, useAPTop25 } from "utils/CFBUtils/cfbGameUtils";
import {
  CFBWeek,
  generateCFBWeeks,
  getCurrentWeekIndex,
} from "utils/CFBUtils/cfbWeeks";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { useHighlights } from "../../hooks/useHighlights";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

function StatsTabContent() {
  const { categories, loading, error } = useSeasonLeaders(2025, "CFB");

  return (
    <SeasonLeadersList
      loading={loading}
      error={error}
      categories={categories}
      league={"CFB"}
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

export default function CFBeagueScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [selectedConference, setSelectedConference] =
    useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recruitView, setRecruitView] = useState<"players" | "teams">(
    "players",
  );
  const [recruitYear, setRecruitYear] = useState(dayjs().year().toString());
  const [recruitTeam, setRecruitTeam] = useState("all");

  const [selectedTab, setSelectedTab] = useState<
    | "scores"
    | "news"
    | "standings"
    | "stats"
    | "awards"
    | "recruting"
    | "bracket"
    | "forum"
  >("scores");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    "scores",
    "news",
    "standings",
    "stats",
    "awards",
    "bracket",
    "recruting",
    "forum",
  ] as const;

  // --- News & Highlights ---
  const { news: cfbNews, loading: cfbLoading } = useLeagueNews("CFB");
  const { highlights } = useHighlights("cfb", "", 10);
  const { data, loading, error, refresh } = useCFPBracket();

  // --- Week handling ---
  const weeks: CFBWeek[] = React.useMemo(() => generateCFBWeeks(), []);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    getCurrentWeekIndex(weeks),
  );
  const selectedWeek = weeks[selectedWeekIndex];

  // --- AP Top 25 from rankings ---
  const apTop25 = useAPTop25();

  const top25Teams = React.useMemo(() => {
    return apTop25.map((t) => t.name);
  }, [apTop25]);

  const selectedWeekForAPI = React.useMemo(() => {
    // If user selects Championship, use Bowls API week
    if (selectedWeek.label.toLowerCase() === "championship") {
      const bowlsWeek = weeks.find((w) => w.label.toLowerCase() === "bowls");
      return bowlsWeek ?? selectedWeek;
    }
    return selectedWeek;
  }, [selectedWeek, weeks]);

  const {
    games: cfbgames,
    loading: cfbloading,
    refresh: refreshcfbgames,
  } = useCFBGamesByWeek({ week: selectedWeekForAPI, weeks });

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
    }, []),
  );

  // --- Header with rotating chevron ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="CFB"
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference ?? undefined}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshcfbgames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = cfbNews.map((item) => ({
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
        new Date(a.publishedAt || new Date().toISOString()).getTime(),
    );
    return combined;
  }, [cfbNews, highlights]);

  const isValidBowlStage = (game: CFBGame) => {
    const stage = game?.game?.stage;
    return (
      typeof stage === "string" &&
      (stage.startsWith("FBS") || stage.startsWith("FCS (Division I-A)"))
    );
  };

  // --- Filter games by selected conference ---
  const filteredGames = React.useMemo(() => {
    // 🔒 Always filter by valid stage first
    const stageFilteredGames = cfbgames.filter(isValidBowlStage);

    const weekLabel = selectedWeek.label.toLowerCase();

    // 🏆 Bowl / Championship logic
    if (weekLabel.includes("bowl") || weekLabel.includes("championship")) {
      if (weekLabel.includes("championship")) {
        // Championship week: show only the final game
        return stageFilteredGames.length
          ? [stageFilteredGames[stageFilteredGames.length - 1]]
          : [];
      }

      // Bowls week: exclude championship game
      if (stageFilteredGames.length > 0) {
        const sorted = [...stageFilteredGames].sort(
          (a, b) =>
            new Date(a.game?.date?.date ?? 0).getTime() -
            new Date(b.game?.date?.date ?? 0).getTime(),
        );

        return sorted.slice(0, -1);
      }

      return stageFilteredGames;
    }

    // 📅 Regular weeks: conference / Top 25 filtering
    return filterCFBGames({
      games: stageFilteredGames,
      selectedConference,
      top25Teams,
    });
  }, [cfbgames, selectedConference, top25Teams, selectedWeek]);

  return (
    <>
      <View style={styles.container}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <WeekSelector
                weeks={weeks}
                selectedWeekIndex={selectedWeekIndex}
                onSelectWeek={setSelectedWeekIndex}
                monthTextStyle={styles.monthText}
                monthTextSelectedStyle={styles.monthTextSelected}
              />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                <CFBGamesList
                  games={filteredGames}
                  loading={cfbloading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                />
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100 }}
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
                <CFBStandingsList />
              ) : (
                <CFBConferenceStandingsList
                  selectedConference={selectedConference}
                />
              )}
            </>
          )}

          {selectedTab === "stats" && <StatsTabContent />}
          {selectedTab === "awards" && <AwardSeasons league="CFB" />}

          {selectedTab === "bracket" && data && <Bracket data={data} />}

          {selectedTab === "recruting" && (
            <RecruitsList
              year={recruitYear}
              team={recruitTeam}
              view={recruitView}
              onYearChange={setRecruitYear}
              onTeamChange={setRecruitTeam}
              onViewChange={setRecruitView}
            />
          )}
          {selectedTab === "forum" && <LeagueForum league="CFB" />}
        </View>
      </View>

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf ?? "")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
      />
    </>
  );
}
