import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

const GAME_CATEGORIES = ["points", "assists", "rebounds"] as const;

const SEASON_CATEGORIES = [
  "pointsPerGame",
  "assistsPerGame",
  "reboundsPerGame",
] as const;

type Category =
  | (typeof GAME_CATEGORIES)[number]
  | (typeof SEASON_CATEGORIES)[number];

type StatLabels = {
  key: Category;
  label: string;
};

const STAT_KEYS: StatLabels[] = [
  { key: "points", label: "Points" },
  { key: "assists", label: "Assists" },
  { key: "rebounds", label: "Rebounds" },
  { key: "pointsPerGame", label: "Points" },
  { key: "assistsPerGame", label: "Assists" },
  { key: "reboundsPerGame", label: "Rebounds" },
];

type Props = {
  leaders: any[];
  awayTeamId: number;
  homeTeamId: number;
  awayLogo: ImageSourcePropType | string | null;
  homeLogo: ImageSourcePropType | string | null;
  awayCode: string;
  homeCode: string;
  isDark: boolean;
  loading?: boolean;
  error?: boolean;
  league?: string;
  state?: string;
};

type StatProps = {
  label: string;
  value: string | number;
  isDark: boolean;
};

function normalizeImageSource(
  source: ImageSourcePropType | string | null | undefined,
): ImageSourcePropType {
  if (!source) return Placeholder;

  if (typeof source === "string") {
    return { uri: source };
  }

  return source;
}

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
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  isDark,
  loading = false,
  error = false,
  state,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const styles = gameLeadersStyles(isDark);
  const global = globalStyles(isDark);

  const isScheduled = state === "pre";
  const inProgress = state === "in";

  useEffect(() => {
    setSelectedCategory(isScheduled ? "pointsPerGame" : "points");
  }, [isScheduled]);

  const getLabel = (key: Category) =>
    STAT_KEYS.find((s) => s.key === key)?.label.toUpperCase() ?? key;

  const tabs = isScheduled ? SEASON_CATEGORIES : GAME_CATEGORIES;

  const topPlayers = useMemo(() => {
    const makePlaceholder = (teamId: number) => ({
      category: selectedCategory,
      team: { id: teamId },
      isPlaceholder: true,
    });

    if (!leaders?.length && !inProgress) return [];

    if (inProgress && leaders?.length === 0) {
      return [makePlaceholder(awayTeamId), makePlaceholder(homeTeamId)];
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

    const filtered = flat.filter((p) => p.category === selectedCategory);

    const awayPlayer = filtered.find(
      (p) => String(p.team?.id) === String(awayTeamId),
    );

    const homePlayer = filtered.find(
      (p) => String(p.team?.id) === String(homeTeamId),
    );

    return [
      awayPlayer ?? makePlaceholder(awayTeamId),
      homePlayer ?? makePlaceholder(homeTeamId),
    ];
  }, [
    leaders,
    selectedCategory,
    isScheduled,
    inProgress,
    awayTeamId,
    homeTeamId,
  ]);

  const renderStats = (player: any) => {
    if (player.isPlaceholder) {
      return (
        <>
          <Stat label="PTS" value="–" isDark={isDark} />
          <Stat label="AST" value="–" isDark={isDark} />
          <Stat label="REB" value="–" isDark={isDark} />
        </>
      );
    }

    switch (selectedCategory) {
      case "points":
        return (
          <>
            <Stat label="PTS" value={player.points} isDark={isDark} />
            <Stat label="FG" value={player.fieldGoals} isDark={isDark} />
            <Stat label="FT" value={player.freeThrows} isDark={isDark} />
          </>
        );

      case "assists":
        return (
          <>
            <Stat label="AST" value={player.assists} isDark={isDark} />
            <Stat label="TO" value={player.turnovers} isDark={isDark} />
            <Stat
              label="AST/TO"
              value={player.assistTurnoverRatio}
              isDark={isDark}
            />
          </>
        );

      case "rebounds":
        return (
          <>
            <Stat label="REB" value={player.totReb} isDark={isDark} />
            <Stat
              label="DREB"
              value={player.defensiveRebounds}
              isDark={isDark}
            />
            <Stat
              label="OREB"
              value={player.offensiveRebounds}
              isDark={isDark}
            />
          </>
        );

      case "pointsPerGame":
        return (
          <>
            <Stat label="PTS" value={player.avgPoints} isDark={isDark} />
            <Stat label="FT%" value={player.freeThrowPct} isDark={isDark} />
            <Stat label="FG%" value={player.fieldGoalPct} isDark={isDark} />
          </>
        );

      case "assistsPerGame":
        return (
          <>
            <Stat label="AST" value={player.avgAssists} isDark={isDark} />
            <Stat label="TO" value={player.avgTurnovers} isDark={isDark} />
            <Stat label="MIN" value={player.avgMinutes} isDark={isDark} />
          </>
        );

      case "reboundsPerGame":
        return (
          <>
            <Stat label="REB" value={player.avgRebounds} isDark={isDark} />
            <Stat
              label="DREB"
              value={player.avgDefensiveRebounds}
              isDark={isDark}
            />
            <Stat
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

  if (error) {
    return <Text style={global.errorText}>Failed to load leaders</Text>;
  }

  if (loading) {
    return <GameLeadersSkeleton />;
  }

  if (!topPlayers.length) {
    return null;
  }

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
          const isAwayRow = idx === 0;
          const teamLogo = isAwayRow ? awayLogo : homeLogo;
          const teamCode = isAwayRow ? awayCode : homeCode;
          const sideLabel = isAwayRow ? "AWAY" : "HOME";

          const p = player.localPlayer || {
            first_name: "Unknown",
            last_name: "Player",
            headshot_url: Placeholder,
            jersey_number: "–",
          };

          return (
            <View key={`${sideLabel}-${teamCode}`} style={styles.card}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={normalizeImageSource(p.headshot_url)}
                  style={styles.avatar}
                />
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
                  source={normalizeImageSource(teamLogo)}
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
