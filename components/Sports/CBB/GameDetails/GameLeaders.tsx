import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { teams } from "constants/teamsCBB";
import { teams as SLTeams } from "constants/teams";
import { useEffect, useMemo, useState } from "react";
import { Image, Text, TextStyle, useColorScheme, View } from "react-native";
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
  lighter?: boolean;
  loading?: boolean;
  error?: boolean;
  league?: string;
  gameStatusDescription: string;
};

type StatProps = {
  label: string;
  value: string | number;
  sub: TextStyle;
  lighter?: boolean;
};

function Stat({ label, value, lighter = false }: StatProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameLeadersStyles(isDark, lighter);

  return (
    <View style={{ marginRight: 12 }}>
      <Text
        style={{
          color: lighter
            ? Colors.lightGray
            : isDark
            ? Colors.midTone
            : Colors.midTone,
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
  lighter = false,
  loading = false,
  error = false,
  league,
  gameStatusDescription,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const styles = gameLeadersStyles(isDark, lighter);
  const global = globalStyles(isDark, lighter);
  const isScheduled = gameStatusDescription === "Scheduled";
  useEffect(() => {
    setSelectedCategory(isScheduled ? "pointsPerGame" : "points");
  }, [isScheduled]);

  const getLabel = (key: Category) =>
    STAT_KEYS.find((s) => s.key === key)?.label ?? key;

  const tabs = isScheduled ? SEASON_CATEGORIES : GAME_CATEGORIES;

  const isSummerLeague =
  league === "nba-summer" ||
  league === "summerleague" ||
  league === "sl";

const teamSource = isSummerLeague
  ? SLTeams
  : teams;

  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;

  const subTextColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.midTone;

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
                  : athleteSafe.headshot?.href ?? Placeholder,
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="FG"
              value={player.fieldGoals}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="FT"
              value={player.freeThrows}
              lighter={lighter}
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="TO"
              value={player.turnovers}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="AST/TO"
              value={player.assistTurnoverRatio}
              lighter={lighter}
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="DREB"
              value={player.defensiveRebounds}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="OREB"
              value={player.offensiveRebounds}
              lighter={lighter}
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="FT%"
              value={player.freeThrowPct}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="FG%"
              value={player.fieldGoalPct}
              lighter={lighter}
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="TO"
              value={player.avgTurnovers}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="MIN"
              value={player.avgMinutes}
              lighter={lighter}
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
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="DREB"
              value={player.avgDefensiveRebounds}
              lighter={lighter}
            />
            <Stat
              sub={styles.statText}
              label="OREB"
              value={player.avgOffensiveRebounds}
              lighter={lighter}
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
      <HeadingTwo lighter={lighter}>
        {isScheduled ? "Season Leaders" : "Game Leaders"}
      </HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          lighter={lighter}
          renderLabel={(tab) => {
            const isSelected = tab === selectedCategory;

            return (
              <Text
                style={{
                  fontFamily: Fonts.OSMEDIUM,
                  fontSize: 14,
                  color: isSelected ? textColor : subTextColor,
                }}
              >
                {getLabel(tab)}
              </Text>
            );
          }}
        />

        {topPlayers.map((player, idx) => {
          const p = player.localPlayer;

const teamObj = teamSource.find(
  (t) => String(t.espnID) === String(player.team?.id)
) ?? teamSource.find(
  (t) => String(t.espnID) === String(homeTeamId)
) ?? teamSource.find(
  (t) => String(t.espnID) === String(awayTeamId)
);

// Type guard for teams that have wLogo
function hasWLogo(team: any): team is { wLogo?: string } {
  return team && "wLogo" in team;
}

const teamLogo = teamObj
  ? isWomen
    ? lighter
      ? hasWLogo(teamObj)
        ? teamObj.wLogo || teamObj.logoLight || teamObj.logo
        : teamObj.logoLight || teamObj.logo
      : isDark
      ? hasWLogo(teamObj)
        ? teamObj.wLogo || teamObj.logoLight || teamObj.logo
        : teamObj.logoLight || teamObj.logo
      : hasWLogo(teamObj)
      ? teamObj.wLogo || teamObj.logo
      : teamObj.logo
    : lighter
    ? teamObj.logoLight || teamObj.logo
    : isDark
    ? teamObj.logoLight || teamObj.logo
    : teamObj.logo
  : Placeholder;


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
