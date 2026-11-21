import Dropdown from "components/Dropdown";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { usePlayoffBracket } from "hooks/LeagueHooks/usePlayoffBracket";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PlayoffLeague, PlayoffTeam } from "types/playoffs";
import {
  getDefaultPlayoffSeason,
  getPlayoffSeasonLabel,
} from "utils/playoffs/playoffConfig";
import PlayoffBracket from "./PlayoffBracket";
import PlayoffBracketSkeleton from "./PlayoffBracketSkeleton";

const TEAM_ROUTES = {
  nba: "/team/[teamId]",
  wnba: "/team/wnba/[teamId]",
  mlb: "/team/mlb/[teamId]",
  nfl: "/team/nfl/[teamId]",
  nhl: "/team/nhl/[teamId]",
} as const;

type Props = { league: PlayoffLeague; active?: boolean };
export default function LeaguePlayoffs({ league, active = true }: Props) {
  // Reset selection when a parent reuses the component for another league.
  return <LeaguePlayoffSeason key={league} league={league} active={active} />;
}
function LeaguePlayoffSeason({ league, active }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);
  const navigationContentStyle = useNavigationBarContentStyle();
  const router = useScopedRouter();
  const latestSeason = getDefaultPlayoffSeason(league);
  const [season, setSeason] = useState(latestSeason);
  const { data, loading, refreshing, refresh } = usePlayoffBracket(
    league,
    season,
    active,
  );
  const currentYear = new Date().getUTCFullYear();
  const seasonCount = league === "wnba" ? currentYear + 2 - 2022 : 20;
  const options = Array.from({ length: seasonCount }, (_, index) => ({
    value: String(currentYear + 1 - index),
    label: getPlayoffSeasonLabel(league, currentYear + 1 - index),
  }));
  const openTeam = (team: PlayoffTeam) => {
    if (team.id === null) return;
    router.push({
      pathname: TEAM_ROUTES[league],
      params: { teamId: String(team.id) },
    });
  };
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={navigationContentStyle(styles.content)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.text}
        />
      }
    >
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={global.title}>{league.toUpperCase()} Playoffs</Text>
        </View>
        <Dropdown
          options={options}
          selectedValue={String(season)}
          onSelect={(value) => setSeason(Number(value))}
          isDark={isDark}
          width={132}
          accessibilityLabel="Playoff season"
        />
      </View>
      {loading ? (
        <PlayoffBracketSkeleton league={league} />
      ) : data ? (
        <PlayoffBracket data={data} onTeamPress={openTeam} />
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 24 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    zIndex: 2,
  },
  headingText: { flex: 1 },
});
