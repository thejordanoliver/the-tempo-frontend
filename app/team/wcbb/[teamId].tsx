import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import Roster from "components/Sports/CBB/Team/Roster";
import CBBRosterStats from "components/Sports/CBB/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCBBTeam, getTeamInfo } from "constants/teamsCBB";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useRosterStats } from "hooks/CBBHooks/useCBBRosterStats";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: { position: number };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const team = getCBBTeam(Number(teamId), true);
  const styles = teamDetailStyles;

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const teamInfo = getTeamInfo(Number(teamId), true);
  const espnId = teamInfo?.espnID;
  const {
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats("wcbb", espnId ?? 0);
  const tabs = [
    "schedule",
    "news",
    "roster",
    "stats",
    "standings",
    "forum",
  ] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");

  const pagerRef = useRef<PagerView>(null);
  const rosterRef = useRef<{ refresh: () => void }>(null);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const {
    games: teamGames = [],
    loading: gamesLoading,
    refreshGames,
  } = useCBBTeamGames(team?.wid ?? "", { isWomen: true });

  const {
    players,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = usePlayersByTeam(team?.espnID?.toString() ?? "", true);

  /** ---------------- MONTHS ---------------- */

  const gameCountByMonth = useMemo(() => {
    const map = new Map<string, number>();

    teamGames.forEach((game) => {
      const d = new Date(game.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return map;
  }, [teamGames]);

  const monthsToShow = useMemo(() => {
    const map = new Map<string, { month: number; year: number }>();

    teamGames.forEach((g) => {
      const d = new Date(g.date);
      map.set(`${d.getFullYear()}-${d.getMonth()}`, {
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    });

    return Array.from(map.values()).sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
    );
  }, [teamGames]);

  const initialSelectedDate = useMemo(() => {
    if (monthsToShow.length === 0) return null;

    const today = new Date();
    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear(),
    );

    const start = currentMonth ?? monthsToShow[0];
    return new Date(start.year, start.month, 1);
  }, [monthsToShow]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate,
  );

  useEffect(() => {
    if (selectedDate || monthsToShow.length === 0) return;

    const today = new Date();
    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear(),
    );

    const start = currentMonth ?? monthsToShow[0];
    setSelectedDate(new Date(start.year, start.month, 1));
  }, [monthsToShow, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "schedule") {
        await refreshGames?.();
      } else if (selectedTab === "roster") {
        rosterRef.current?.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const filteredGames = useMemo(() => {
    if (!selectedDate) return teamGames;
    return teamGames.filter((g) => {
      const d = new Date(g.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [teamGames, selectedDate]);

  /** ---------------- NEWS & HIGHLIGHTS ---------------- */

  const { highlights: teamHighlights, loading: highlightsLoading } =
    useTeamHighlights("wcbb", team?.fullName ?? "", 5);

  const { articles: newsArticles, loading: newsLoading } = useTeamNews(
    team?.fullName ?? "",
    "WCBB",
  );

  const combinedNewsAndHighlights = useMemo(() => {
    const taggedNews = newsArticles.map((item) => ({
      ...item,
      itemType: "news" as const,
      publishedAt: item.publishedAt ?? new Date().toISOString(),
    }));

    const taggedHighlights = teamHighlights.map((item) => ({
      ...item,
      itemType: "highlight" as const,
      publishedAt: item.publishedAt ?? new Date().toISOString(),
      duration: String(item.duration),
    }));

    const combined = [...taggedNews, ...taggedHighlights];
    combined.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return combined;
  }, [newsArticles, teamHighlights]);

  /** ---------------- HEADER ---------------- */

  const { toggleNotifications, isNotified } = useNotifications();
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "WCBB";
  const favorited = team ? isFavorite(league, team.wid ?? 0) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.wid}
          logo={team?.wLogo || team?.logoLight || team?.logo}
          logoLight={team?.wLogo || team?.logoLight}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          isNotified={notfied}
          onToggleNotifications={() => toggleNotifications(league, teamKey)}
          onToggleFavorite={() => team && toggleFavorite(league, team.wid ?? 0)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /** ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);
          pagerRef.current?.setPage(tabToIndex(tab));
        }}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(e: PageSelectedEvent) => {
          setSelectedTab(indexToTab(e.nativeEvent.position));
        }}
      >
        {/* Schedule Page */}
        <View key="schedule" style={{ flex: 1 }}>
          <View style={styles.monthSelector}>
            <MonthSelector
              months={monthsToShow}
              selectedDate={selectedDate}
              onSelect={(month, year) =>
                setSelectedDate(new Date(year, month, 1))
              }
              loading={gamesLoading}
              gameCountByMonth={gameCountByMonth}
            />
          </View>
          <CBBGamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showHeaders={false}
            isWomen={true}
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1, paddingBottom: 100 }}>
          <NewsHighlightsList
            items={combinedNewsAndHighlights}
            loading={newsLoading || highlightsLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </ScrollView>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
          <Roster
            players={players}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            isWomen={true}
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={{ flex: 1 }}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              rosterStats={rosterStats}
              espnId={team.espnID}
              teamId={Number(team.id)}
              league="wcbb"
              loading={statsLoading}
              error={statsError}
              refreshing={refreshingStats}
              onRefresh={refreshRosterStats}
            />
          )}
        </View>
        {/* Standings Page */}
        <View key="standings" style={{ flex: 1 }}>
          <CBBConferenceStandingsList
            onlyTeamConference
            teamName={team.fullName}
            women
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="WCBB" />
        </View>
      </PagerView>

      {/* Team Info Modal */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="WCBB"
        />
      )}
    </View>
  );
}
