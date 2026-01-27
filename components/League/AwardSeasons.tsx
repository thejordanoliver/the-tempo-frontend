import { Dropdown } from "components/Dropdown";
import ChampionsTable from "components/League/ChampionsTable";
import { Colors } from "constants/Colors";

import { getTeamLogo } from "constants/teams";
import { getTeamLogo as getCFBTeamLogo } from "constants/teamsCFB";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { useCFBAwardSchools } from "hooks/CFBHooks/useCFBAwardSchools";
import { useChampionTeams } from "hooks/CFBHooks/useChampionTeams";
import { AwardCategory, League } from "hooks/useAwardSeasons";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import CFBAwardSchoolsTable from "../Sports/CFB/League/CFBAwardSchoolsTable";
import { AwardSeasonsTable } from "./AwardSeasonsTable";
import TopThreeTeams from "./TopThreeTeams";
type ViewMode = "champions" | "players" | "teams";

const VIEW_MODE_OPTIONS = [
  { label: "Championships", value: "champions" },
  { label: "Players", value: "players" },
  { label: "Teams", value: "teams" },
];

const LEAGUE_CHAMPIONS_TITLE: Partial<Record<League, string>> = {
  CFB: "College Football Champions",
  NBA: "NBA Champions",
  NFL: "Super Bowl Champions",
  MLB: "World Series Champions",
};

const AWARD_CONFIG: Partial<
  Record<League, { label: string; value: AwardCategory; title: string }[]>
> = {
  NBA: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NBA MVP" },
    { label: "ROTY", value: "roy", title: "NBA Rookie of the Year" },
    { label: "DPOY", value: "dpoy", title: "NBA Defensive Player of the Year" },
    { label: "6MOY", value: "sixthman", title: "NBA Sixth Man of the Year" },
    { label: "COY", value: "coy", title: "NBA Coach of the Year" },
    { label: "MIP", value: "mip", title: "NBA Most Improved Player" },
    { label: "FMVP", value: "fmvp", title: "NBA Finals MVP" },
  ],

  CFB: [
    { label: "All Awards", value: "all", title: "" },
    { label: "Heisman Trophy", value: "heisman", title: "Heisman Trophy" },
    {
      label: "AP Player of the Year",
      value: "apoy",
      title: "AP Player of the Year",
    },
    { label: "Walter Camp POY", value: "camp", title: "Walter Camp POY" },
    { label: "Maxwell Award", value: "maxwell", title: "Maxwell Award" },
    {
      label: "Fred Biletnikoff Award",
      value: "biletnikoff",
      title: "Fred Biletnikoff Award",
    },
    { label: "Doak Walker Award", value: "doak", title: "Doak Walker Award" },
    { label: "John Mackey Award", value: "mackey", title: "John Mackey Award" },
    { label: "Lou Groza Award", value: "groza", title: "Lou Groza Award" },
    {
      label: "Dave Rimington Trophy",
      value: "rimington",
      title: "Dave Rimington Trophy",
    },
    { label: "Outland Trophy", value: "outland", title: "Outland Trophy" },
    { label: "Jim Thorpe Award", value: "thorpe", title: "Jim Thorpe Award" },
    {
      label: "Bronko Nagurski Award",
      value: "nagurski",
      title: "Bronko Nagurski Award",
    },
    { label: "Dick Butkus Award", value: "butkus", title: "Dick Butkus Award" },
    {
      label: "Ted Hendricks Award",
      value: "hendricks",
      title: "Ted Hendricks Award",
    },
    { label: "Lombardi Award", value: "lombardi", title: "Lombardi Award" },
    { label: "Ronnie Lott Trophy", value: "lott", title: "Ronnie Lott Trophy" },
    {
      label: "Davey O’Brien Award",
      value: "obrien",
      title: "Davey O’Brien Award",
    },
    { label: "Manning Award", value: "manning", title: "Manning Award" },
    {
      label: "Johnny Unitas Award",
      value: "unitas",
      title: "Johnny Unitas Award",
    },
    {
      label: "AP Coach of the Year",
      value: "apcoy",
      title: "AP Coach of the Year",
    },
    {
      label: "AFCA Coach of the Year",
      value: "afca",
      title: "AFCA Coach of the Year",
    },
  ],

  NFL: [
    { label: "All Awards", value: "all", title: "" },
    { label: "MVP", value: "mvp", title: "NFL Most Valuable Player" },
    {
      label: "OROY",
      value: "ropoy",
      title: "NFL Offensive Rookie of the Year",
    },
    {
      label: "DROY",
      value: "rdpoy",
      title: "NFL Defensive Rookie of the Year",
    },
    { label: "OPOY", value: "opoy", title: "NFL Offensive Player of the Year" },
    { label: "DPOY", value: "dpoy", title: "NFL Defensive Player of the Year" },
    {
      label: "Coach of the Year",
      value: "coy",
      title: "NFL Coach of the Year",
    },
  ],
};

type Props = {
  league: League;
  lighter?: boolean;
};

export default function AwardSeasons({ league, lighter = false }: Props) {
  const isDark = useColorScheme() === "dark";

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const styles = useMemo(
    () => awardTableStyles(isDark, lighter),
    [isDark, lighter]
  );

  const [selectedAward, setSelectedAward] = useState<AwardCategory>("all");

  const [viewMode, setViewMode] = useState<ViewMode>("players");

  const awards = AWARD_CONFIG[league] ?? [];
  const awardOptions = awards.map(({ label, value }) => ({
    label,
    value,
  }));

  const showAwardTopThree = league === "CFB" && viewMode === "teams";

  const showChampionTopThree = viewMode === "champions";

  const { data: awardTeams } = useCFBAwardSchools({
    category: selectedAward,
    enabled: showAwardTopThree,
  });

  const championTeamsResult =
    league === "CFB" || league === "NBA" || league === "NFL"
      ? useChampionTeams({
          league,
          enabled: showChampionTopThree,
        })
      : { data: [], loading: false };

  const championTeams = championTeamsResult.data;

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 100,
        paddingTop: 12,
      }}
    >
      <View style={styles.dropdownRow}>
        {!(viewMode === "champions") && (
          <Dropdown
            options={awardOptions}
            selectedValue={selectedAward}
            onSelect={(val) => setSelectedAward(val as AwardCategory)}
            isDark={isDark}
          />
        )}

        {/* View mode dropdown (CFB only) */}
        {
          <Dropdown
            options={VIEW_MODE_OPTIONS}
            selectedValue={viewMode}
            onSelect={(val) => setViewMode(val as ViewMode)}
            isDark={isDark}
          />
        }
        {!awardOptions && (
          <Dropdown
            options={awardOptions}
            selectedValue={selectedAward}
            onSelect={(val) => setSelectedAward(val as AwardCategory)}
            isDark={isDark}
          />
        )}
      </View>
      {showChampionTopThree && championTeams.length > 0 && (
        <TopThreeTeams
          teams={championTeams.map((t) => {
            return {
              team: t.team,
              value: t.total_championships,
              logo:
                league === "NBA"
                  ? getTeamLogo(t.team.id, isDark)
                  : league === "CFB"
                  ? getCFBTeamLogo(t.team.id, isDark)
                  : getNFLTeamsLogo(t.team.id, isDark),
            };
          })}
        />
      )}
      {showAwardTopThree && awardTeams.length > 0 && (
        <TopThreeTeams
          limit={5}
          teams={awardTeams.map((t) => ({
            team: t.team,
            value: t.total_awards,
            logo: getCFBTeamLogo(t.team.id, isDark),
          }))}
        />
      )}
      {/* Champions */}
      {viewMode === "champions" &&
        (league === "CFB" || league === "NBA" || league === "NFL") && (
          <ChampionsTable
            key={`${league}-champions-${refreshKey}`}
            title={LEAGUE_CHAMPIONS_TITLE[league] ?? "Champions"}
            league={league}
          />
        )}

      {/* Teams */}
      {league === "CFB" &&
        viewMode === "teams" &&
        awards.map(({ value, title }) => {
          if (value === "all") return null;
          if (selectedAward !== "all" && selectedAward !== value) return null;

          return (
            <CFBAwardSchoolsTable
              key={`cfb-teams-${value}-${refreshKey}`}
              category={value}
              title={title}
            />
          );
        })}
      {/* Players */}
      {viewMode === "players" &&
        awards.map(({ value, title }) => {
          if (value === "all") return null;
          if (selectedAward !== "all" && selectedAward !== value) return null;

          return (
            <AwardSeasonsTable
              key={`${league}-${value}-${refreshKey}`}
              league={league}
              category={value}
              title={title}
              lighter={lighter}
              refreshSignal={refreshKey}
            />
          );
        })}
    </ScrollView>
  );
}
