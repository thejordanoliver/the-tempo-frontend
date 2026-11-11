import ForumFeed from "components/Forum/ForumFeed";
import MonthSelector from "components/League/Selectors/MonthSelector";
import NewsList from "components/News/NewsList";
import GamesList from "components/Sports/Volleyball/VolleyballGamesList";
import VolleyballTable from "components/Sports/Volleyball/VolleyballTable";
import TeamDetailScreen from "components/Team/TeamDetailScreen";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useTeamNews } from "hooks/NewsHooks/useTeamNews";
import { useTeamDetailScreen } from "hooks/TeamHooks/useTeamDetailScreen";
import { useVolleyballTeamGames } from "hooks/VolleyballHooks/useVolleyballTeamGames";
import { View } from "react-native";
import { TeamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import type { VolleyballLeagueKey } from "types/volleyball/volleyball";

export default function VolleyballTeamScreen({
  league,
}: {
  league: VolleyballLeagueKey;
}) {
  const { teamId } = useLocalSearchParams<{ teamId?: string | string[] }>();
  const id = Number(Array.isArray(teamId) ? teamId[0] : teamId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const schedule = useVolleyballTeamGames(league, validId ? id : null);
  const team = schedule.data?.team;
  const { resolvedColorScheme } = usePreferences();
  const logo = useMemo(() => {
    const uri =
      (resolvedColorScheme === "dark" ? team?.logoDark : team?.logo) ??
      team?.logo;
    return uri ? { uri } : null;
  }, [resolvedColorScheme, team?.logo, team?.logoDark]);
  const screen = useTeamDetailScreen({
    loading: schedule.loading,
    tabLeague: league,
    header: {
      league,
      teamId: validId ? id : 0,
      teamName: team?.shortName ?? team?.name,
      title: team?.shortName ?? team?.name ?? "Team",
      teamColor: team?.primaryColor ?? Colors.midTone,
      logo,
      favorite: validId ? { lookupId: id, toggleId: id } : undefined,
      infoEnabled: true,
      notificationsEnabled: false,
    },
  });
  const news = useTeamNews(league, id, 10, {
    enabled: validId && screen.hasVisitedTab("news"),
  });
  const refreshSchedule = () => screen.runRefresh(schedule.refresh);

  return (
    <TeamDetailScreen ready={validId} screen={screen}>
      <View key="schedule" style={TeamDetailStyles.contentArea}>
        <MonthSelector
          months={schedule.months}
          selected={schedule.selectedMonthKey}
          onSelect={schedule.selectMonth}
          loading={schedule.loading}
        />
        <GamesList
          games={schedule.games}
          loading={schedule.loading}
          refreshing={schedule.refreshing || screen.refreshing}
          error={schedule.error}
          onRefresh={refreshSchedule}
          showHeaders
          scrollEnabled
          showCountdown={schedule.showCountdown}
          countdownGame={schedule.firstSeasonGame}
          isMCVB={league === "mcvb"}
          isWCVB={league === "wcvb"}
        />
      </View>
      <View key="news" style={TeamDetailStyles.contentArea}>
        <NewsList
          items={news.articles}
          loading={news.loading}
          error={news.error}
          refreshing={news.refreshing}
          loadingMore={news.loadingMore}
          onRefresh={news.refresh}
          isDark={screen.isDark}
        />
      </View>
      <View key="standings" style={TeamDetailStyles.contentArea}>
        <VolleyballTable league={league} />
      </View>
      <View key="forum" style={TeamDetailStyles.contentArea}>
        <ForumFeed teamId={validId ? String(id) : ""} league={league} />
      </View>
    </TeamDetailScreen>
  );
}
