import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { teams as SLTeams } from "constants/teams";
import { cbbTeams, getCBBTeamLogo } from "constants/teamsCBB";
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
  {
    key: "points",
    label: "Points",
  },
  {
    key: "assists",
    label: "Assists",
  },
  {
    key: "rebounds",
    label: "Rebounds",
  },
  {
    key: "pointsPerGame",
    label: "Points",
  },
  {
    key: "assistsPerGame",
    label: "Assists",
  },
  {
    key: "reboundsPerGame",
    label: "Rebounds",
  },
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
          color: isDark ? Colors.midTone : Colors.midTone,
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
  useEffect(() => {
    setSelectedCategory(isScheduled ? "pointsPerGame" : "points");
  }, [isScheduled]);

  const getLabel = (key: Category) =>
    STAT_KEYS.find((s) => s.key === key)?.label.toUpperCase() ?? key;

  const tabs = isScheduled ? SEASON_CATEGORIES : GAME_CATEGORIES;

  const isSummerLeague =
    league === "nba-summer" || league === "summerleague" || league === "sl";

  const teamSource = isSummerLeague ? SLTeams : cbbTeams;

  const topPlayers = useMemo(() => {
    if (!leaders?.length) return [];

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

          // ✅ SAFE ATHLETE FALLBACK
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
            // Game Leaders
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

            // Season Leaders

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

    return flat.filter((p) => p.category === selectedCategory);
  }, [leaders, selectedCategory]);
  const isWomen = league === "wcbb";

  const renderStats = (player: any) => {
    switch (selectedCategory) {
      case "points":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="PTS"
              value={player.points}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="FG"
              value={player.fieldGoals}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="FT"
              value={player.freeThrows}
              isDark={isDark}
            />
          </>
        );

      case "assists":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="AST"
              value={player.assists}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="TO"
              value={player.turnovers}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="AST/TO"
              value={player.assistTurnoverRatio}
              isDark={isDark}
            />
          </>
        );

      case "rebounds":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="REB"
              value={player.totReb}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="DREB"
              value={player.defensiveRebounds}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="OREB"
              value={player.offensiveRebounds}
              isDark={isDark}
            />
          </>
        );

      case "pointsPerGame":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="PTS"
              value={player.avgPoints}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="FT%"
              value={player.freeThrowPct}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="FG%"
              value={player.fieldGoalPct}
              isDark={isDark}
            />
          </>
        );

      case "assistsPerGame":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="AST"
              value={player.avgAssists}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="TO"
              value={player.avgTurnovers}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="MIN"
              value={player.avgMinutes}
              isDark={isDark}
            />
          </>
        );

      case "reboundsPerGame":
        return (
          <>
            <Stat
              sub={styles.statText}
              label="REB"
              value={player.avgRebounds}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="DREB"
              value={player.avgDefensiveRebounds}
              isDark={isDark}
            />
            <Stat
              sub={styles.statText}
              label="OREB"
              value={player.avgOffensiveRebounds}
              isDark={isDark}
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
          tabs={tabs} // ✅ just pass the array
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
          const p = player.localPlayer;

          const teamObj =
            teamSource.find(
              (t) => String(t.espnID) === String(player.team?.id),
            ) ??
            teamSource.find((t) => String(t.espnID) === String(homeTeamId)) ??
            teamSource.find((t) => String(t.espnID) === String(awayTeamId));

          const teamLogo = getCBBTeamLogo(teamObj?.id, isDark, isWomen);

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
