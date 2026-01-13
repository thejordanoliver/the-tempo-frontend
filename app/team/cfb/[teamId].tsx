import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CFBGamesList from "components/CFB/Games/CFBGamesList";
import { CFBConferenceStandingsList } from "components/CFB/Standings/CFBConferenceStandingsList";
import Roster from "components/CFB/Team/Roster";
import FootballRosterStats from "components/CFB/Team/RosterStats";
import TeamForum from "components/Forum/TeamForum";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import TeamInfoModal from "components/Team/TeamInfoModal";
import { conferenceListMap, teams } from "constants/teamsCFB";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBTeamGames } from "hooks/CFBHooks/useCFBTeamGames";
import { useFavoriteTeams } from "hooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Game } from "types/cfb";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { style } from "../../../styles/TeamDetailsStyles";
type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

function getTeamConference(teamName?: string): string | null {
  if (!teamName) return null;

  for (const [conference, teams] of Object.entries(conferenceListMap)) {
    if (teams.includes(teamName)) {
      return conference;
    }
  }

  return null;
}

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cachedGames, setCachedGames] = useState<Game[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = style(isDark);

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
  const rosterRef = useRef<{ refresh: () => void }>(null);

  const pagerRef = useRef<PagerView>(null);

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
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useCFBTeamGames(teamIdNum ? teamIdNum.toString() : "");

  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("cfb", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "", "CFB");

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

  // --- Load cached games on mount ---
  useEffect(() => {
    const loadCachedGames = async () => {
      if (!teamIdNum) return;
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!cached) return;

        const { timestamp, data } = JSON.parse(cached);
        const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (diffHours < CACHE_EXPIRY_HOURS) {
          setCachedGames(data);
        } else {
          await AsyncStorage.removeItem(CACHE_KEY);
        }
      } catch (err) {
        console.error("Failed to load cached games:", err);
      }
    };
    loadCachedGames();
  }, [teamIdNum]);

  // --- Save fresh games to cache ---
  useEffect(() => {
    if (!teamIdNum || !rawTeamGames?.length) return;
    const saveToCache = async () => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: rawTeamGames })
        );
      } catch (err) {
        console.error("Failed to save games to cache:", err);
      }
    };
    saveToCache();
  }, [rawTeamGames, teamIdNum]);

  // --- Memoize valid games ---
  const teamGames = useMemo(
    () =>
      (cachedGames.length ? cachedGames : rawTeamGames).filter(
        (g: Game) => g?.game?.date?.date
      ),
    [cachedGames, rawTeamGames]
  );

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      } else if (selectedTab === "roster") {
        rosterRef.current?.refresh();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Use the favorite teams hook
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const { toggleNotifications, isNotified } = useNotifications();
  const league = "CFB";
  const favorited = team ? isFavorite(league, team.id) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;
  
  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team?.logo ? { uri: team.logo } : undefined}
          logoLight={team?.logoLight ? { uri: team.logoLight } : undefined}
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

  if (!teamIdNum || !team) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
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
        <ScrollView
          key="schedule"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <CFBGamesList
            games={teamGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showHeaders={true}
            scrollEnabled={false}
          />
        </ScrollView>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1 }}>
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
            ref={rosterRef}
            teamId={String(team.id)}
            teamName={team.name}
            league="CFB"
          />
        </View>

        {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <FootballRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
              league="cfb"
            />
          )}
        </ScrollView>

        {/* Forum Page */}
        <View key="standings" style={{ flex: 1 }}>
          <CFBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>
        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="CFB" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="CFB"
        />
      )}
    </View>
  );
}
