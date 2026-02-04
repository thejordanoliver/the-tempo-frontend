import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";

import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import CBBRosterStats from "components/Sports/CBB/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";

import { Colors } from "constants/Colors";
import { teams } from "constants/teamsCBB";

import { useNotifications } from "contexts/NotificationContext";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";

import CustomActivityIndicator from "components/CustomActivityIndicator";
import Roster from "components/Sports/CBB/Team/Roster";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { CBBGame } from "types/types";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { style } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: { position: number };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? Number(teamId) : null;

  const isDark = useColorScheme() === "dark";
  const styles = style(isDark);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cachedGames, setCachedGames] = useState<CBBGame[]>([]);

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

  const team = useMemo(
    () => (teamIdNum ? teams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum]
  );

  const CACHE_KEY = `teamGames-${teamIdNum}`;
  const CACHE_EXPIRY_HOURS = 6;

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames,
  } = useCBBTeamGames(teamIdNum ? teamIdNum.toString() : "");
  // console.log(rawTeamGames)
  const teamGames = useMemo(
    () =>
      (cachedGames.length ? cachedGames : rawTeamGames).filter(
        (g) => !!g?.date
      ),
    [cachedGames, rawTeamGames]
  );

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
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)
    );
  }, [teamGames]);

  const initialSelectedDate = useMemo(() => {
    if (monthsToShow.length === 0) return null;

    const today = new Date();
    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear()
    );

    const start = currentMonth ?? monthsToShow[0];
    return new Date(start.year, start.month, 1);
  }, [monthsToShow]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate
  );

  useEffect(() => {
    // Only initialize once, when data arrives
    if (selectedDate || monthsToShow.length === 0) return;

    const today = new Date();

    const currentMonth = monthsToShow.find(
      (m) => m.month === today.getMonth() && m.year === today.getFullYear()
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

  const {
    players,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = usePlayersByTeam(team?.espnID?.toString() ?? "");

  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("cbb", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "", "CBB");

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
      duration: String(item.duration), // ✅ fix type mismatch
    }));

    const combined = [...taggedNews, ...taggedHighlights];

    combined.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    });

    return combined;
  }, [newsArticles, teamHighlights]);

  /** ---------------- CACHE ---------------- */

  useEffect(() => {
    if (!teamIdNum) return;
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (!cached) return;
      const { timestamp, data } = JSON.parse(cached);
      if ((Date.now() - timestamp) / 36e5 < CACHE_EXPIRY_HOURS) {
        setCachedGames(data);
      }
    });
  }, [teamIdNum]);

  useEffect(() => {
    if (!teamIdNum || !rawTeamGames.length) return;
    AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: rawTeamGames })
    );
  }, [rawTeamGames, teamIdNum]);

  /** ---------------- HEADER ---------------- */

  const { toggleNotifications, isNotified } = useNotifications();

  // ✅ Use the favorite teams hook
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "CBB";
  const favorited = team ? isFavorite(league, team.id) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team?.logo}
          logoLight={team?.logoLight}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          teamCode={team?.code}
          isFavorite={favorited}
          isNotified={notfied} // ✅ MATCH
          onToggleNotifications={() => toggleNotifications(league, teamKey)}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, isDark, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

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
          const index = e.nativeEvent.position;
          setSelectedTab(indexToTab(index));
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
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1, paddingBottom: 100 }}>
          <NewsHighlightsList
            items={combinedNewsAndHighlights}
            error={newsError || highlightsError}
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
            teamColor={team?.color ?? Colors.midTone}
            isDark={isDark}
          />
        </View>

        {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
              league="CBB"
            />
          )}
        </ScrollView>

        {/* Forum Page */}
        <View key="standings" style={{ flex: 1 }}>
          <CBBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>
        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="CBB" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="CBB"
        />
      )}
    </View>
  );
}
