import { useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import NewsList from "components/News/NewsList";
import { Bracket } from "components/Sports/CFB/Bracket/Bracket";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/Sports/CFB/ConferenceListModal";
import CFBGamesList from "components/Sports/CFB/Games/CFBGamesList";
import RecruitsList from "components/Sports/CFB/Recruiting/RecruitsList";
import { CFBConferenceStandingsList } from "components/Sports/CFB/Standings/CFBConferenceStandingsList";
import { CFBStandingsList } from "components/Sports/CFB/Standings/CFBStandingsList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import WeekSelector from "components/Sports/NFL/WeekSelector";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFPBracket } from "hooks/CFBHooks/useCFPBracket";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useFootballGamesByWeek } from "hooks/NFLHooks/useFootballGamesByWeek";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { useAPTop25 } from "utils/CFBUtils/cfbGameUtils";
import { getFootballSeasonYear } from "utils/dateUtils";
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

  const [refreshing, setRefreshing] = useState(false);
  const { data: bracketData } = useCFPBracket();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const { categories, loading, error } = useSeasonLeaders(
    getFootballSeasonYear(),
    "CFB",
  );
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, "CFB");
  const apTop25 = useAPTop25();
  const top25Teams = React.useMemo(() => {
    return apTop25.map((t) => t.name);
  }, [apTop25]);
  const {
    weeks,
    loading: gamesLoading,
    refetch: refetchGames,
  } = useFootballGamesByWeek(getFootballSeasonYear(), 2);
  const weekLabels = Object.keys(weeks);
  const weekArray = weekLabels.map((label) => ({
    label,
    stage: weeks[label][0]?.game?.stage || "Unknown",
  }));
  const selectedWeekLabel = weekLabels[selectedWeekIndex] || "";
  const selectedWeekGamesRaw = weeks[selectedWeekLabel] || [];
  const selectedWeekGames = React.useMemo(() => {
    let filtered = selectedWeekGamesRaw;

    // ----------------------------------
    // FILTER
    // ----------------------------------
    if (selectedConference === "Top 25") {
      filtered = filtered.filter((g) => {
        const home = g.teams?.home?.name;
        const away = g.teams?.away?.name;

        return top25Teams.includes(home) || top25Teams.includes(away);
      });
    } else if (selectedConference && selectedConference !== "All") {
      filtered = filtered.filter((g) => {
        const homeConf = g.teams?.home?.conferenceShortName;
        const awayConf = g.teams?.away?.conferenceShortName;

        return (
          homeConf === selectedConference || awayConf === selectedConference
        );
      });
    }

    // ----------------------------------
    // SORT (by conference → then time)
    // ----------------------------------
    return filtered.sort((a, b) => {
      const confA =
        a.teams?.home?.conference || a.teams?.away?.conference || "";
      const confB =
        b.teams?.home?.conference || b.teams?.away?.conference || "";

      // 1. Sort by conference name
      if (confA !== confB) {
        return confA.localeCompare(confB);
      }

      // 2. Sort by game time
      const timeA = a.game?.date?.timestamp || 0;
      const timeB = b.game?.date?.timestamp || 0;

      return timeA - timeB;
    });
  }, [selectedWeekGamesRaw, selectedConference, top25Teams]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchGames()]);
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
        isDark={isDark}
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
              weeks={weekArray}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              isDark={isDark}
              loading={gamesLoading}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              <CFBGamesList
                games={selectedWeekGames}
                loading={gamesLoading}
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
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <NewsList
                items={articles}
                isDark={isDark}
                loading={newsLoading}
                error={newsError}
                refreshing
                onRefresh={handleRefresh}
              />
            </ScrollView>
          </View>
          {/* STANDINGS */}
          <View key="standings">
            <>
              {selectedConference === "Top 25" || !selectedConference ? (
                <CFBStandingsList />
              ) : (
                <CFBConferenceStandingsList
                  selectedConference={selectedConference}
                />
              )}
            </>
          </View>
          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={"CFB"}
              isDark={isDark}
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
