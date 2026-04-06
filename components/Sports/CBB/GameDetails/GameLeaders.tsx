import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { teams as SLTeams } from "constants/teams";
import { cbbTeams, getCBBTeamLogo } from "constants/teamsCBB";
import { getWNBATeamLogo, wnbaTeams } from "constants/teamsWNBA";
import { useEffect, useMemo, useState } from "react";
import { Image, Text, TextStyle, View } from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

type StatLabels = {
  key: Category;
  label: string;
};

const GAME_CATEGORIES = ["points", "assists", "rebounds"] as const;

const SEASON_CATEGORIES = [
  "pointsPerGame",
  "assistsPerGame",
  "reboundsPerGame",
] as const;

const STAT_KEYS: StatLabels[] = [
  { key: "points", label: "Points" },
  { key: "assists", label: "Assists" },
  { key: "rebounds", label: "Rebounds" },
  { key: "pointsPerGame", label: "Points" },
  { key: "assistsPerGame", label: "Assists" },
  { key: "reboundsPerGame", label: "Rebounds" },
];

type Category =
  | (typeof GAME_CATEGORIES)[number]
  | (typeof SEASON_CATEGORIES)[number];

type Props = {
  leaders: any[];
  awayTeamId: number;
  homeTeamId: number;
  isDark: boolean;
  loading?: boolean;
  error?: boolean;
  league?: string;
  gameStatusDescription: string;
};

type StatProps = {
  label: string;
  value: string | number;
  sub: TextStyle;
  isDark: boolean;
};

function Stat({ label, value, isDark }: StatProps) {
  const styles = gameLeadersStyles(isDark);

  return (
    <View style={{ marginRight: 12 }}>
      <Text
        style={{
          color: Colors.midTone,
          fontFamily: Fonts.OSMEDIUM,
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

export default function GameLeaders({
  leaders,
  awayTeamId,
  homeTeamId,
  isDark,
  loading = false,
  error = false,
  league,
  gameStatusDescription,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const styles = gameLeadersStyles(isDark);
  const global = globalStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const isInProgress =
    gameStatusDescription !== "Scheduled" &&
    gameStatusDescription !== "Finished";

  useEffect(() => {
    setSelectedCategory(isScheduled ? "pointsPerGame" : "points");
  }, [isScheduled]);

  const getLabel = (key: Category) =>
    STAT_KEYS.find((s) => s.key === key)?.label.toUpperCase() ?? key;

  const tabs = isScheduled ? SEASON_CATEGORIES : GAME_CATEGORIES;

  const isSummerLeague =
    league === "nba-summer" || league === "summerleague" || league === "sl";
  const isWNBA = league === "wnba";

  const teamSource = isWNBA ? wnbaTeams : isSummerLeague ? SLTeams : cbbTeams;
  const isWomen = league === "wcbb";

  // -----------------------------
  // PREP TOP PLAYERS OR PLACEHOLDERS
  // -----------------------------
  const topPlayers = useMemo(() => {
    const makePlaceholder = (teamId: number) => ({
      category: selectedCategory,
      team: { id: teamId },
      isPlaceholder: true,
    });

    // No data and game not in progress — hide section entirely
    if (!leaders?.length && !isInProgress) return [];

    // Game in progress but no stats yet — show 2 placeholder rows
    if (isInProgress && leaders?.length === 0) {
      return [makePlaceholder(homeTeamId), makePlaceholder(awayTeamId)];
    }

    const flat: any[] = [];

    leaders.forEach((group) => {
      const teamId = Number(group.team?.id);

      (group.leaders ?? []).forEach((statGroup: any) => {
        if (!statGroup?.name) return;

        const category = statGroup.name as Category;

        const validCategories: readonly Category[] = isScheduled
          ? SEASON_CATEGORIES
          : GAME_CATEGORIES;

        if (!validCategories.includes(category)) return;

        (statGroup.leaders ?? []).forEach((entry: any) => {
          const athlete = entry?.athlete;

          const athleteSafe =
            athlete && athlete.id && athlete.fullName
              ? athlete
              : {
                  id: `unknown-${teamId}-${category}`,
                  fullName: "Unknown Player",
                  shortName: "Unknown",
                  headshot: Placeholder,
                  jersey: "–",
                };

          const stats = entry.statistics ?? [];

          const getStat = (name: string) =>
            stats.find((s: any) => s.name === name)?.value ?? "–";

          const getStatDisplay = (name: string) =>
            stats.find((s: any) => s.name === name)?.displayValue ?? "–";

          flat.push({
            category,
            team: { id: teamId },
            isPlaceholder: false,
            localPlayer: {
              id: athleteSafe.id,
              first_name: athleteSafe.fullName.split(" ")[0] ?? "Unknown",
              last_name:
                athleteSafe.fullName.split(" ").slice(1).join(" ") ?? "Player",
              headshot_url:
                typeof athleteSafe.headshot === "string"
                  ? athleteSafe.headshot
                  : (athleteSafe.headshot?.href ?? Placeholder),
              jersey_number: athleteSafe.jersey ?? "–",
            },
            points: getStat("points"),
            totReb: getStat("rebounds"),
            assists: getStat("assists"),
            fieldGoals: getStatDisplay("fieldGoals"),
            freeThrows: getStatDisplay("freeThrows"),
            turnovers: getStatDisplay("turnovers"),
            minutes: getStatDisplay("minutes"),
            assistTurnoverRatio: getStatDisplay("assistTurnoverRatio"),
            defensiveRebounds: getStatDisplay("defensiveRebounds"),
            offensiveRebounds: getStatDisplay("offensiveRebounds"),
            avgPoints: getStatDisplay("avgPoints"),
            fieldGoalPct: getStatDisplay("fieldGoalPct"),
            freeThrowPct: getStatDisplay("freeThrowPct"),
            avgRebounds: getStatDisplay("avgRebounds"),
            avgDefensiveRebounds: getStatDisplay("avgDefensiveRebounds"),
            avgOffensiveRebounds: getStatDisplay("avgOffensiveRebounds"),
            avgAssists: getStatDisplay("avgAssists"),
            avgMinutes: getStatDisplay("avgMinutes"),
            avgTurnovers: getStatDisplay("avgTurnovers"),
          });
        });
      });
    });

    // --- KEY FIX: always guarantee one row per team ---
    const filtered = flat.filter((p) => p.category === selectedCategory);

    const homePlayer = filtered.find(
      (p) => String(p.team?.id) === String(homeTeamId),
    );
    const awayPlayer = filtered.find(
      (p) => String(p.team?.id) === String(awayTeamId),
    );

    return [
      homePlayer ?? makePlaceholder(homeTeamId),
      awayPlayer ?? makePlaceholder(awayTeamId),
    ];
  }, [
    leaders,
    selectedCategory,
    isScheduled,
    isInProgress,
    homeTeamId,
    awayTeamId,
  ]);

  // -----------------------------
  // RENDER STATS OR PLACEHOLDER
  // -----------------------------
  const renderStats = (player: any) => {
    if (player.isPlaceholder) {
      return (
        <>
          <Stat label="PTS" value="–" isDark={isDark} sub={{}} />
          <Stat label="AST" value="–" isDark={isDark} sub={{}} />
          <Stat label="REB" value="–" isDark={isDark} sub={{}} />
        </>
      );
    }

    switch (selectedCategory) {
      case "points":
        return (
          <>
            <Stat label="PTS" value={player.points} isDark={isDark} sub={{}} />
            <Stat
              label="FG"
              value={player.fieldGoals}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="FT"
              value={player.freeThrows}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      case "assists":
        return (
          <>
            <Stat label="AST" value={player.assists} isDark={isDark} sub={{}} />
            <Stat
              label="TO"
              value={player.turnovers}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="AST/TO"
              value={player.assistTurnoverRatio}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      case "rebounds":
        return (
          <>
            <Stat label="REB" value={player.totReb} isDark={isDark} sub={{}} />
            <Stat
              label="DREB"
              value={player.defensiveRebounds}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="OREB"
              value={player.offensiveRebounds}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      case "pointsPerGame":
        return (
          <>
            <Stat
              label="PTS"
              value={player.avgPoints}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="FT%"
              value={player.freeThrowPct}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="FG%"
              value={player.fieldGoalPct}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      case "assistsPerGame":
        return (
          <>
            <Stat
              label="AST"
              value={player.avgAssists}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="TO"
              value={player.avgTurnovers}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="MIN"
              value={player.avgMinutes}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      case "reboundsPerGame":
        return (
          <>
            <Stat
              label="REB"
              value={player.avgRebounds}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="DREB"
              value={player.avgDefensiveRebounds}
              isDark={isDark}
              sub={{}}
            />
            <Stat
              label="OREB"
              value={player.avgOffensiveRebounds}
              isDark={isDark}
              sub={{}}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (error)
    return <Text style={global.errorText}>Failed to load leaders</Text>;
  if (loading) return <GameLeadersSkeleton />;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>
        {isScheduled ? "Season Leaders" : "Game Leaders"}
      </HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          isDark={isDark}
          renderLabel={(tab, isSelected) => (
            <Text
              style={{
                fontSize: 18,
                color: isSelected
                  ? isDark
                    ? Colors.white
                    : Colors.black
                  : Colors.midTone,
                fontFamily: Fonts.OSREGULAR,
              }}
            >
              {getLabel(tab)}
            </Text>
          )}
        />

        {topPlayers.map((player, idx) => {
          const p = player.localPlayer || {
            first_name: "Unknown",
            last_name: "Player",
            headshot_url: Placeholder,
            jersey_number: "–",
          };

          const teamObj =
            teamSource.find(
              (t) => String(t.espnID) === String(player.team?.id),
            ) ??
            teamSource.find((t) => String(t.espnID) === String(homeTeamId)) ??
            teamSource.find((t) => String(t.espnID) === String(awayTeamId));

          const teamLogo =
            league === "wnba"
              ? getWNBATeamLogo(teamObj?.id, isDark)
              : getCBBTeamLogo(teamObj?.id, isDark, isWomen);

          return (
            <View key={idx} style={styles.card}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: p.headshot_url }} style={styles.avatar} />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.playerName}>
                    {p.first_name} {p.last_name}
                  </Text>
                  <Text style={styles.jersey}>#{p.jersey_number}</Text>
                </View>
                <View style={styles.statRow}>{renderStats(player)}</View>
              </View>

              {teamLogo && (
                <Image
                  source={teamLogo}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
