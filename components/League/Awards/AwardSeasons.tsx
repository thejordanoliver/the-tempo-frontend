import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useAwardSchools } from "hooks/CFBHooks/useAwardSchools";
import { useChampionTeams } from "hooks/CFBHooks/useChampionTeams";
import { useAwardSeasons } from "hooks/useAwardSeasons";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import { AWARD_CONFIG, AwardCategory, LeagueType } from "types/types";
import AwardSchoolsTable from "./AwardSchoolsTable";
import { AwardSeasonsTable } from "./AwardSeasonsTable";
import ChampionsTable from "./ChampionsTable";
import TopThreeTeams from "./TopThreeTeams";
type ViewMode = "champions" | "players" | "teams";

const LEAGUE_CHAMPIONS_TITLE: Partial<Record<LeagueType, string>> = {
  CFB: "College Football Champions",
  WNBA: "WNBA Champions",
  CBB: "Men's College Basketball Champions",
  WCBB: "Women's College Basketball Champions",
  NBA: "NBA Champions",
  NFL: "Super Bowl Champions",
  MLB: "World Series Champions",
  NHL: "Stanley Cup Champions",
};

type Props = {
  league: LeagueType;
};

export default function AwardSeasons({ league }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => awardTableStyles(isDark), [isDark]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAward, setSelectedAward] = useState<AwardCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("players");

  const VIEW_MODE_OPTIONS = [
    { label: "Championships", value: "champions" },
    { label: "Players", value: "players" },

    // Only show "Teams" for CFB, CBB, WCBB
    ...(league === "CFB" || league === "CBB" || league === "WCBB"
      ? [{ label: "Teams", value: "teams" }]
      : []),
  ];

  const apiLeague = useMemo(() => {
    switch (league) {
      case "CFB":
        return "cfb";
      case "CBB":
      case "WCBB":
        return "cbb";
      default:
        return undefined;
    }
  }, [league]);

  const { data, loading, error, refetch } = useAwardSeasons({
    league,
  });
  const {
    data: awardSchools,
    loading: awardSchoolsLoading,
    error: awardSchoolsError,
  } = useAwardSchools({
    league: apiLeague,
    category: selectedAward,
  });

  const dataByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    data.forEach((row) => {
      const key = row.award_type;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    return grouped;
  }, [data]);
  /* ------------------------------------------------ */
  /* League → API mapping (FIXED + SAFE)             */
  /* ------------------------------------------------ */

  /* ------------------------------------------------ */
  /* Award Teams Hook                                */
  /* ------------------------------------------------ */

  const showAwardTopThree =
    (league === "CFB" || league === "CBB" || league === "WCBB") &&
    viewMode === "teams";

  const { data: awardTeams } = useAwardSchools({
    league: apiLeague,
    category: selectedAward,
    enabled: showAwardTopThree && !!apiLeague,
  });

  /* ------------------------------------------------ */
  /* Champion Teams Hook                             */
  /* ------------------------------------------------ */

  const showChampionTopThree = viewMode === "champions";

  const championTeamsResult =
    league === "NHL" ||
    league === "MLB" ||
    league === "CFB" ||
    league === "CBB" ||
    league === "WCBB" ||
    league === "WNBA" ||
    league === "NBA" ||
    league === "NFL"
      ? useChampionTeams({
          league,
          enabled: showChampionTopThree,
        })
      : { data: [], loading: false };

  const championTeams = championTeamsResult.data;
  const awards = AWARD_CONFIG[league] ?? [];

  /* ------------------------------------------------ */
  /* Refresh                                          */
  /* ------------------------------------------------ */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch()]);
    setRefreshing(false);
  };
  /* ------------------------------------------------ */
  /* Render                                           */
  /* ------------------------------------------------ */

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
      contentContainerStyle={styles.contentContainerStyle}
    >
      {/* Dropdowns */}
      <View style={styles.dropdownRow}>
        {viewMode !== "champions" && awards.length > 0 && (
          <Dropdown
            options={awards.map(({ label, value }) => ({ label, value }))}
            selectedValue={selectedAward}
            onSelect={(val) => setSelectedAward(val as AwardCategory)}
            isDark={isDark}
          />
        )}

        <Dropdown
          options={VIEW_MODE_OPTIONS} // now "Teams" is only in CFB/CBB/WCBB
          selectedValue={viewMode}
          onSelect={(val) => setViewMode(val as ViewMode)}
          isDark={isDark}
        />
      </View>

      {/* ------------------------------------------------ */}
      {/* Champion Top 3                                   */}
      {/* ------------------------------------------------ */}

      {showChampionTopThree && championTeams.length > 0 && (
        <TopThreeTeams
          teams={championTeams.map((t) => ({
            team: t.team,
            value: t.total_championships,
            logo:
              league === "NBA"
                ? getTeamLogo(t.team.id, isDark)
                : league === "WNBA"
                  ? getWNBATeamLogo(t.team.id, isDark)
                  : league === "CFB"
                    ? getCFBTeamLogo(t.team.id, isDark)
                    : league === "CBB"
                      ? getCBBTeamLogo(t.team.id, isDark)
                      : league === "WCBB"
                        ? getCBBTeamLogo(t.team.id, isDark, true)
                        : league === "MLB"
                          ? getMLBTeamLogo(t.team.id, isDark)
                          : league === "NHL"
                            ? getNHLTeamLogo(t.team.id, isDark)
                            : getNFLTeamLogo(t.team.id, isDark),
          }))}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* Award Top 3 (CFB / CBB / WCBB)                  */}
      {/* ------------------------------------------------ */}

      {showAwardTopThree && awardTeams.length > 0 && apiLeague && (
        <TopThreeTeams
          limit={3}
          teams={awardTeams.map((t) => ({
            team: t.team,
            value: t.total_awards,
            logo:
              league === "CFB"
                ? getCFBTeamLogo(t.team.id, isDark)
                : getCBBTeamLogo(t.team.id, isDark, league === "WCBB"),
          }))}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* Champions Table                                  */}
      {/* ------------------------------------------------ */}

      {viewMode === "champions" &&
        (league === "NBA" ||
          league === "WNBA" ||
          league === "NFL" ||
          league === "MLB" ||
          league === "CFB" ||
          league === "CBB" ||
          league === "NHL" ||
          league === "WCBB") && (
          <ChampionsTable
            key={`${league}-champions`}
            title={LEAGUE_CHAMPIONS_TITLE[league] ?? "Champions"}
            league={league}
          />
        )}

      {/* ------------------------------------------------ */}
      {/* Teams Table (Unified)                            */}
      {/* ------------------------------------------------ */}

      {(league === "CFB" || league === "CBB" || league === "WCBB") &&
        viewMode === "teams" &&
        awards.map(({ value, title }) => {
          if (value === "all") return null;

          if (selectedAward !== "all" && selectedAward !== value) return null;

          return (
            <AwardSchoolsTable
              key={`${league}-teams-${value}`}
              league={apiLeague}
              category={value}
              title={title}
              data={awardSchools}
              loading={awardSchoolsLoading}
              error={awardSchoolsError}
            />
          );
        })}

      {/* ------------------------------------------------ */}
      {/* Players Table                                    */}
      {/* ------------------------------------------------ */}

      {viewMode === "players" &&
        (league === "NBA" ||
          league === "WNBA" ||
          league === "NFL" ||
          league === "CFB" ||
          league === "CBB" ||
          league === "NHL" ||
          league === "MLB" ||
          league === "WCBB") &&
        awards.map(({ value, title }) => {
          if (value === "all") return null;

          if (selectedAward !== "all" && selectedAward !== value) return null;

          return (
            <AwardSeasonsTable
              key={`${league}-${value}`}
              category={value}
              title={title}
              data={dataByCategory[value]}
              loading={loading}
              error={error}
            />
          );
        })}
    </ScrollView>
  );
}
