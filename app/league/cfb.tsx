import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
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
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { CFBGame } from "types/cfb";
import { filterCFBGames, useAPTop25 } from "utils/CFBUtils/cfbGameUtils";
import {
  CFBWeek,
  generateCFBWeeks,
  getCurrentWeekIndex,
} from "utils/CFBUtils/cfbWeeks";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function CFBeagueScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
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
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("CFB");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { data: bracketData } = useCFPBracket();
  // --- Week handling ---
  const weeks: CFBWeek[] = React.useMemo(() => generateCFBWeeks(), []);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    getCurrentWeekIndex(weeks),
  );
  const selectedWeek = weeks[selectedWeekIndex];
  const { categories, loading, error } = useSeasonLeaders(2025, "CFB");

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
              <CFBGamesList
                games={filteredGames}
                loading={cfbloading}
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

          {/* RANKINGS */}
          <View key="rankings" style={styles.contentArea}>
            <CFBStandingsList />
          </View>

          {/* STANDINGS */}
          <View key="standings" style={styles.contentArea}>
            <CFBConferenceStandingsList
              selectedConference={selectedConference}
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={"CFB"}
            />
          </View>

          <View key="playoffs" style={styles.contentArea}>
            {bracketData && <Bracket data={bracketData} />}
          </View>

          <View key="recruits" style={styles.contentArea}>
            <RecruitsList
              year={recruitYear}
              team={recruitTeam}
              view={recruitView}
              onYearChange={setRecruitYear}
              onTeamChange={setRecruitTeam}
              onViewChange={setRecruitView}
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league="CFB" />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league="CFB" />
          </View>
        </PagerView>
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
