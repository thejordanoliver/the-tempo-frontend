import { useNavigation } from "@react-navigation/native";
import Roster from "components/CFB/Team/Roster";
import FootballRosterStats from "components/CFB/Team/RosterStats";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import NFLGamesList from "components/NFL/Games/NFLGamesList";
import TeamInfoModal from "components/Team/TeamInfoModal";
import { teams } from "constants/teamsNFL";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNFLTeamGames } from "hooks/NFLHooks/useNFLTeamGames";
import { useFavoriteTeams } from "hooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import TabBar from "../../../components/TabBar";
import { style } from "../../../styles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const league = "NFL";
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = style(isDark);

  const tabs = ["schedule", "news", "roster", "stats", "forum"] as const;
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

const {
  games: rawTeamGames = [],
  loading: gamesLoading,
  refreshGames: refreshTeamGames,
} = useNFLTeamGames(teamIdNum ? teamIdNum.toString() : "", "2025", "1", true);

  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("nfl", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "", "NFL");

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

  const favorited = team ? isFavorite(league, team.id) : false;

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
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, isDark, team, favorited]);

  if (!teamIdNum || !team || gamesLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar
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
          <NFLGamesList
            games={rawTeamGames}
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
            league="NFL"
          />
        </View>

        {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <FootballRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
              league="nfl"
            />
          )}
        </ScrollView>
        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="NFL" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="NFL"
        />
      )}
    </View>
  );
}
