import { useAllRecruits } from "@/hooks/RecruitHooks/useAllRecruits";
import {
  RecruitTeamRanking,
  useTeamRecruitingRankings,
} from "@/hooks/RecruitHooks/useTeamRecruitingRankings";
import { RecruitListStyles } from "@/styles/PlayerStyles/RecruitStyles";
import { Recruit } from "@/types/recruiting/recruits";
import { Ionicons } from "@expo/vector-icons";
import Dropdown from "components/Dropdown";
import SearchBar from "components/SearchBars/AnimatedSearchBar";
import PillTabs, { type PillTabOption } from "components/TabBars/PillTabs";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRecruitingTeams } from "hooks/RecruitHooks/useRecruitingTeams";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";
import RecruitCardSkeleton from "../../Skeletons/RecruitCardSkeleton";
import TeamRankCardSkeleton from "../../Skeletons/TeamRankCardSkeleton";
import RecruitCard from "./RecruitCard";
import RecruitingTeamCard from "./RecruitingTeamCard";

type Props = {
  year: string;
  team: string;
  league: "mcbb" | "cfb";
  view: "recruits" | "teams";
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onViewChange: (v: "recruits" | "teams") => void;
};

type DropdownOption = {
  label: string;
  value: string;
};

type RecruitsHeaderProps = {
  isDark: boolean;
  styles: ReturnType<typeof RecruitListStyles>;
  year: string;
  team: string;
  view: "recruits" | "teams";
  search: string;
  searchOpen: boolean;
  yearOptions: DropdownOption[];
  teamOptions: DropdownOption[];
  viewOptions: PillTabOption<"recruits" | "teams">[];
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onViewChange: (v: "recruits" | "teams") => void;
  onSearchChange: (value: string) => void;
  onToggleSearch: () => void;
};

const ANIMATED_ROW_COUNT = 9;
const LIST_WINDOW_SIZE = 9;

function getTeamRankingKey(item: RecruitTeamRanking, index: number) {
  return `team-ranking-${item.year}-${item.team_id ?? item.id ?? index}`;
}

function getErrorMessage(error: unknown) {
  if (!error) return "Something went wrong.";
  if (error instanceof Error) return error.message;
  return String(error);
}

function normalizeSearchValue(value: string | number | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

const RecruitsHeader = memo(function RecruitsHeader({
  isDark,
  styles,
  year,
  team,
  view,
  search,
  searchOpen,
  yearOptions,
  teamOptions,
  viewOptions,
  onYearChange,
  onTeamChange,
  onViewChange,
  onSearchChange,
  onToggleSearch,
}: RecruitsHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <PillTabs
        tabs={viewOptions}
        selectedValue={view}
        onChange={onViewChange}
      />
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={onToggleSearch} hitSlop={10}>
          <Ionicons
            name={searchOpen ? "close" : "search"}
            size={22}
            color={isDark ? Colors.lightGray : Colors.darkGray}
          />
        </TouchableOpacity>

        <View style={styles.dropdownGroup}>
          <Dropdown
            accessibilityLabel="Recruiting class"
            options={yearOptions}
            selectedValue={year}
            onSelect={onYearChange}
            isDark={isDark}
            width={100}
          />

          {view === "recruits" && (
            <Dropdown
              accessibilityLabel="Recruiting team"
              options={teamOptions}
              selectedValue={team}
              onSelect={onTeamChange}
              isDark={isDark}
              width={120}
            />
          )}
        </View>
      </View>

      <SearchBar
        value={search}
        onChangeText={onSearchChange}
        visible={searchOpen}
        placeholder={
          view === "recruits" ? "Search recruits..." : "Search teams..."
        }
      />
    </View>
  );
});

export default function RecruitsList({
  year,
  team,
  view,
  onYearChange,
  onTeamChange,
  onViewChange,
  league,
}: Props) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => RecruitListStyles(isDark), [isDark]);
  const contentContainerStyle = useMemo(
    () => navigationContentStyle(styles.listContent),
    [navigationContentStyle, styles.listContent],
  );

  const recruitsListRef = useRef<FlatList<Recruit>>(null);
  const teamRankingsListRef = useRef<FlatList<RecruitTeamRanking>>(null);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshingTeamRankings, setRefreshingTeamRankings] = useState(false);
  const query = search.trim().toLowerCase();

  useEffect(() => {
    const list =
      view === "recruits"
        ? recruitsListRef.current
        : teamRankingsListRef.current;
    list?.scrollToOffset({ offset: 0, animated: false });
  }, [year, team, view, league, query]);

  const yearOptions = useMemo(() => {
    const now = new Date().getUTCFullYear();

    return Array.from({ length: now + 3 - 2010 + 1 }, (_, i) => {
      const y = now + 3 - i;
      return { label: String(y), value: String(y) };
    });
  }, []);

  const viewOptions = useMemo<PillTabOption<"recruits" | "teams">[]>(
    () => [
      { label: "Recruits", value: "recruits" },
      { label: "Teams", value: "teams" },
    ],
    [],
  );

  const {
    data: playerData,
    loading: loadingPlayers,
    error: errorPlayers,
    refreshing: refreshingPlayers = false,
    refresh: refreshPlayers,
  } = useAllRecruits(Number(year), league);

  const {
    rankings: teamRankings,
    loading: loadingTeams,
    error: errorTeams,
    refetch: refetchTeamRankings,
  } = useTeamRecruitingRankings(Number(year), league);

  const { teams: recruitingTeams, error: teamFilterError } =
    useRecruitingTeams(league);

  const loading = view === "recruits" ? loadingPlayers : loadingTeams;
  const refreshing =
    view === "recruits" ? refreshingPlayers : refreshingTeamRankings;
  const error = view === "recruits" ? errorPlayers : errorTeams;

  const onRefresh = useCallback(async () => {
    if (view === "recruits") {
      refreshPlayers?.();
      return;
    }

    try {
      setRefreshingTeamRankings(true);
      await refetchTeamRankings();
    } finally {
      setRefreshingTeamRankings(false);
    }
  }, [refetchTeamRankings, refreshPlayers, view]);

  const teamOptions = useMemo(() => {
    return [
      { label: "All Teams", value: "all" },
      ...recruitingTeams
        .map((team) => ({
          label: team.shortName || team.name,
          value: String(team.id),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [recruitingTeams]);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const rankedPlayers = useMemo(
    () =>
      [...playerData].sort(
        (a, b) =>
          (a.industry_national_rank ?? Infinity) -
            (b.industry_national_rank ?? Infinity) ||
          a.name.localeCompare(b.name) ||
          a.id - b.id,
      ),
    [playerData],
  );

  const playerQuery = view === "recruits" ? query : "";
  const teamQuery = view === "teams" ? query : "";

  const filteredPlayers = useMemo(() => {
    let list = rankedPlayers;

    if (team !== "all") {
      const selectedTeam = recruitingTeams.find(
        (option) => String(option.id) === team,
      );
      const teamNames = [selectedTeam?.name, selectedTeam?.shortName]
        .map(normalizeSearchValue)
        .filter(Boolean);
      list = list.filter((recruit) => {
        if (!recruit.is_committed && !recruit.is_signed && !recruit.is_enrolled)
          return false;
        if (recruit.committed_team_id != null)
          return String(recruit.committed_team_id) === team;
        return teamNames.includes(
          normalizeSearchValue(recruit.committed_team_name),
        );
      });
    }

    if (playerQuery) {
      list = list.filter((p: Recruit) => {
        const predictionMatches = p.predicted_schools?.some((prediction) =>
          prediction.team_name?.toLowerCase().includes(playerQuery),
        );

        return (
          p.name?.toLowerCase().includes(playerQuery) ||
          p.position?.toLowerCase().includes(playerQuery) ||
          p.predicted_team_name?.toLowerCase().includes(playerQuery) ||
          p.committed_team_name?.toLowerCase().includes(playerQuery) ||
          p.high_school?.toLowerCase().includes(playerQuery) ||
          p.hometown?.toLowerCase().includes(playerQuery) ||
          predictionMatches
        );
      });
    }

    return list;
  }, [rankedPlayers, team, playerQuery, recruitingTeams]);

  const filteredTeamRankings = useMemo(() => {
    if (!teamQuery) return teamRankings;

    return teamRankings.filter((ranking: RecruitTeamRanking) => {
      return (
        normalizeSearchValue(ranking.team_name).includes(teamQuery) ||
        normalizeSearchValue(ranking.team_slug).includes(teamQuery) ||
        normalizeSearchValue(ranking.rank).includes(teamQuery) ||
        normalizeSearchValue(ranking.previous_rank).includes(teamQuery) ||
        normalizeSearchValue(ranking.total_commits).includes(teamQuery) ||
        normalizeSearchValue(ranking.five_stars).includes(teamQuery) ||
        normalizeSearchValue(ranking.four_stars).includes(teamQuery) ||
        normalizeSearchValue(ranking.three_stars).includes(teamQuery) ||
        normalizeSearchValue(ranking.average_rating).includes(teamQuery) ||
        normalizeSearchValue(ranking.points).includes(teamQuery)
      );
    });
  }, [teamQuery, teamRankings]);

  const getRecruitKey = useCallback(
    (item: Recruit, index: number) =>
      `recruit-${item.year ?? year}-${item.id ?? index}`,
    [year],
  );
  const renderRecruit = useCallback<ListRenderItem<Recruit>>(
    ({ item, index }) => (
      <RecruitCard
        recruit={item}
        animationIndex={index < ANIMATED_ROW_COUNT ? index : undefined}
        league={league}
        isDark={isDark}
      />
    ),
    [isDark, league],
  );
  const renderTeamRanking = useCallback<ListRenderItem<RecruitTeamRanking>>(
    ({ item, index }) => (
      <RecruitingTeamCard
        item={item}
        animationIndex={index < ANIMATED_ROW_COUNT ? index : undefined}
        league={league}
        isDark={isDark}
      />
    ),
    [isDark, league],
  );

  const listHeaderComponent = useMemo(
    () => (
      <>
        <RecruitsHeader
          isDark={isDark}
          styles={styles}
          year={year}
          team={team}
          view={view}
          search={search}
          searchOpen={searchOpen}
          yearOptions={yearOptions}
          teamOptions={teamOptions}
          viewOptions={viewOptions}
          onYearChange={onYearChange}
          onTeamChange={onTeamChange}
          onViewChange={onViewChange}
          onSearchChange={handleSearchChange}
          onToggleSearch={toggleSearch}
        />
        {view === "recruits" && teamFilterError && (
          <Text style={styles.errorText}>{teamFilterError}</Text>
        )}
      </>
    ),
    [
      handleSearchChange,
      isDark,
      onTeamChange,
      onViewChange,
      onYearChange,
      search,
      searchOpen,
      styles,
      team,
      teamOptions,
      teamFilterError,
      toggleSearch,
      view,
      viewOptions,
      year,
      yearOptions,
    ],
  );

  const emptyTitle = useMemo(() => {
    if (search.trim()) {
      return view === "recruits"
        ? "No recruits match your search"
        : "No teams match your search";
    }

    return view === "recruits"
      ? `No recruits found for ${year}`
      : `No team rankings found for ${year}`;
  }, [search, view, year]);

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.headerLayer}>{listHeaderComponent}</View>

        <FlatList
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => `skel-${i}`}
          renderItem={() =>
            view === "recruits" ? (
              <RecruitCardSkeleton />
            ) : (
              <TeamRankCardSkeleton />
            )
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerLayer}>{listHeaderComponent}</View>

        <FlatList
          data={[]}
          keyExtractor={(_, i) => `error-${i}`}
          ListHeaderComponent={
            <View style={styles.center}>
              <Text style={styles.errorText}>
                Error: {getErrorMessage(error)}
              </Text>
              <Text style={styles.helperText}>Pull down to try again.</Text>
            </View>
          }
          renderItem={() => null}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  const activeRowCount =
    view === "recruits" ? filteredPlayers.length : filteredTeamRankings.length;
  if (activeRowCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerLayer}>{listHeaderComponent}</View>

        <FlatList
          data={[]}
          keyExtractor={(_, i) => `empty-${i}`}
          ListHeaderComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>{emptyTitle}</Text>
              <Text style={styles.helperText}>Pull down to refresh.</Text>
            </View>
          }
          renderItem={() => null}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerLayer}>{listHeaderComponent}</View>

      {view === "recruits" ? (
        <FlatList
          key="recruits"
          ref={recruitsListRef}
          data={filteredPlayers}
          keyExtractor={getRecruitKey}
          renderItem={renderRecruit}
          windowSize={LIST_WINDOW_SIZE}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          style={styles.list}
        />
      ) : (
        <FlatList
          key="teams"
          ref={teamRankingsListRef}
          data={filteredTeamRankings}
          keyExtractor={getTeamRankingKey}
          renderItem={renderTeamRanking}
          windowSize={LIST_WINDOW_SIZE}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          style={styles.list}
        />
      )}
    </View>
  );
}
