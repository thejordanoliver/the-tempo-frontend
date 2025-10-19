import { useNavigation } from "@react-navigation/native";
import NFLGamesList from "components/NFL/Games/NFLGamesList";
import NFLRoster from "components/NFL/Team/Roster";
import TeamInfoBottomSheetNFL from "components/NFL/Team/TeamInfoModal";
import { teams } from "constants/teamsNFL";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNFLTeamGames } from "hooks/NFLHooks/useNFLTeamGames";
import { useFavoriteTeams } from "hooks/useFavoriteTeams";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Game } from "types/nfl";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import TabBar from "../../../components/TabBar";
import { style } from "../../../styles/TeamDetails.styles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;

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
  } = useNFLTeamGames(teamIdNum ? teamIdNum.toString() : "");

  const teamGames = useMemo(
    () => rawTeamGames.filter((g: Game) => g?.game?.date?.date),
    [rawTeamGames]
  );

  const flattenedGames = useMemo(() => {
    const grouped: { [stage: string]: Game[] } = {};
    teamGames.forEach((g) => {
      const stage = g.game.stage || "Unknown";
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(g);
    });

    const flat: any[] = [];
    Object.keys(grouped).forEach((stage) => {
      flat.push({ type: "header", title: stage });
      grouped[stage].forEach((game) => flat.push({ type: "game", game }));
    });

    return flat;
  }, [teamGames]);

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
  const league = "NFL";
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

  if (!teamIdNum || !team) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
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
        <View
          key="news"
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>
            Team News (TODO)
          </Text>
        </View>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
          <NFLRoster
            ref={rosterRef}
            teamId={String(team.id)}
            teamName={team.name}
            refreshing={refreshing}
          />
        </View>

        {/* Stats Page */}
        <View
          key="stats"
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>Stats (TODO)</Text>
        </View>

        {/* Forum Page */}
        <View
          key="forum"
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>Forum (TODO)</Text>
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoBottomSheetNFL
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
        />
      )}
    </View>
  );
}
