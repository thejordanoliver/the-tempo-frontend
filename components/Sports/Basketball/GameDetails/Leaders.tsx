import { LeadersType } from "@/hooks/BasketballHooks/useBasketballGameDetails";
import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { LeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

type TeamId = string | number;

type GameCategory = "points" | "assists" | "rebounds";

type SeasonCategory = "pointsPerGame" | "assistsPerGame" | "reboundsPerGame";

type Category = GameCategory | SeasonCategory;

type TeamIdField = "id" | "espnId";

type LeaderEntry = LeadersType["leaders"][number]["leaders"][number];

type DisplayStat = {
  label: string;
  value: string | number;
};

type DisplayPlayer = {
  fullName: string;
  headshot: ImageSourcePropType | string | null;
  jersey: string | null;
  stats: DisplayStat[];
};

type StatDefinition = {
  label: string;
  key: string;
};

type CategoryConfig = {
  label: string;
  stats: StatDefinition[];
};

type ResolvedLeaderTeams = {
  away: LeadersType | undefined;
  home: LeadersType | undefined;
};

type Props = {
  leaders: LeadersType[];
  awayId: TeamId;
  homeId: TeamId;
  awayLogo: ImageSourcePropType | string | null;
  homeLogo: ImageSourcePropType | string | null;
  isDark: boolean;
  error?: boolean;
  state?: string | null;
};

type StatProps = {
  stat: DisplayStat;
  styles: ReturnType<typeof LeadersStyles>;
};

const GAME_CATEGORIES: Category[] = ["points", "assists", "rebounds"];

const SEASON_CATEGORIES: Category[] = [
  "pointsPerGame",
  "assistsPerGame",
  "reboundsPerGame",
];

const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  points: {
    label: "Points",
    stats: [
      { label: "PTS", key: "points" },
      { label: "FG", key: "fieldGoals" },
      { label: "FT", key: "freeThrows" },
    ],
  },
  assists: {
    label: "Assists",
    stats: [
      { label: "AST", key: "assists" },
      { label: "TO", key: "turnovers" },
      { label: "AST/TO", key: "assistTurnoverRatio" },
    ],
  },
  rebounds: {
    label: "Rebounds",
    stats: [
      { label: "REB", key: "rebounds" },
      { label: "DREB", key: "defensiveRebounds" },
      { label: "OREB", key: "offensiveRebounds" },
    ],
  },
  pointsPerGame: {
    label: "Points",
    stats: [
      { label: "PTS", key: "avgPoints" },
      { label: "FT%", key: "freeThrowPct" },
      { label: "FG%", key: "fieldGoalPct" },
    ],
  },
  assistsPerGame: {
    label: "Assists",
    stats: [
      { label: "AST", key: "avgAssists" },
      { label: "TO", key: "avgTurnovers" },
      { label: "MIN", key: "avgMinutes" },
    ],
  },
  reboundsPerGame: {
    label: "Rebounds",
    stats: [
      { label: "REB", key: "avgRebounds" },
      { label: "DREB", key: "avgDefensiveRebounds" },
      { label: "OREB", key: "avgOffensiveRebounds" },
    ],
  },
};

function idsMatch(first: unknown, second: TeamId): boolean {
  return first != null && String(first) === String(second);
}

function normalizeImageSource(
  source: ImageSourcePropType | string | null | undefined,
): ImageSourcePropType {
  if (!source) {
    return Placeholder;
  }

  return typeof source === "string" ? { uri: source } : source;
}

function findTeamGroup(
  leaders: LeadersType[],
  teamId: TeamId,
  field: TeamIdField,
): LeadersType | undefined {
  return leaders.find((group) => idsMatch(group.team[field], teamId));
}

function resolveUsingField(
  leaders: LeadersType[],
  awayId: TeamId,
  homeId: TeamId,
  field: TeamIdField,
): ResolvedLeaderTeams | null {
  const away = findTeamGroup(leaders, awayId, field);
  const home = findTeamGroup(leaders, homeId, field);

  if (!away || !home || away === home) {
    return null;
  }

  return { away, home };
}

function resolveLeaderTeams(
  leaders: LeadersType[],
  awayId: TeamId,
  homeId: TeamId,
): ResolvedLeaderTeams {
  /*
   * Resolve both teams with database IDs first.
   *
   * This prevents a value such as 24 from matching one team's database ID
   * and another team's ESPN ID.
   */
  const databaseIdMatch = resolveUsingField(leaders, awayId, homeId, "id");

  if (databaseIdMatch) {
    return databaseIdMatch;
  }

  const espnIdMatch = resolveUsingField(leaders, awayId, homeId, "espnId");

  if (espnIdMatch) {
    return espnIdMatch;
  }

  /*
   * Fallback for responses where the IDs are mixed. The selected groups
   * must still be different.
   */
  const awayCandidates = leaders.filter(
    (group) =>
      idsMatch(group.team.id, awayId) || idsMatch(group.team.espnId, awayId),
  );

  const homeCandidates = leaders.filter(
    (group) =>
      idsMatch(group.team.id, homeId) || idsMatch(group.team.espnId, homeId),
  );

  for (const away of awayCandidates) {
    const home = homeCandidates.find((candidate) => candidate !== away);

    if (home) {
      return { away, home };
    }
  }

  return {
    away: awayCandidates[0],
    home: homeCandidates.find((candidate) => candidate !== awayCandidates[0]),
  };
}

function getStatValue(
  entry: LeaderEntry,
  statName: string,
  isPrimaryStat: boolean,
): string | number {
  const statistic = entry.statistics.find((stat) => stat.name === statName);

  if (statistic?.displayValue) {
    return statistic.displayValue;
  }

  if (isPrimaryStat) {
    return entry.mainStat?.value ?? entry.displayValue ?? entry.value ?? "–";
  }

  return "–";
}

function createPlaceholder(category: Category): DisplayPlayer {
  return {
    fullName: "Unknown Player",
    headshot: Placeholder,
    jersey: null,
    stats: CATEGORY_CONFIG[category].stats.map(({ label }) => ({
      label,
      value: "–",
    })),
  };
}

function getTopPlayer(
  teamGroup: LeadersType | undefined,
  category: Category,
): DisplayPlayer {
  const categoryGroup = teamGroup?.leaders.find(
    (group) => group.name === category,
  );

  const leader = categoryGroup?.leaders[0];

  if (!leader) {
    return createPlaceholder(category);
  }

  return {
    fullName:
      leader.athlete.fullName || leader.athlete.shortName || "Unknown Player",
    headshot: leader.athlete.headshot,
    jersey: leader.athlete.jersey,
    stats: CATEGORY_CONFIG[category].stats.map(({ label, key }, index) => ({
      label,
      value: getStatValue(leader, key, index === 0),
    })),
  };
}

function Stat({ stat, styles }: StatProps) {
  return (
    <View style={{ marginRight: 12 }}>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statText}>{stat.value}</Text>
    </View>
  );
}

export default function Leaders({
  leaders,
  awayId,
  homeId,
  awayLogo,
  homeLogo,
  isDark,
  error = false,
  state,
}: Props) {
  const isScheduled = state === "pre";

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    isScheduled ? "pointsPerGame" : "points",
  );

  const styles = LeadersStyles(isDark);
  const global = globalStyles(isDark);

  const tabs = isScheduled ? SEASON_CATEGORIES : GAME_CATEGORIES;

  useEffect(() => {
    setSelectedCategory(isScheduled ? "pointsPerGame" : "points");
  }, [isScheduled]);

  const resolvedTeams = useMemo(
    () => resolveLeaderTeams(leaders, awayId, homeId),
    [leaders, awayId, homeId],
  );

  const hasAnyLeaders = leaders.some((teamGroup) =>
    teamGroup.leaders.some(
      (categoryGroup) =>
        tabs.includes(categoryGroup.name as Category) &&
        categoryGroup.leaders.length > 0,
    ),
  );

  if (error) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>
          {isScheduled ? "Season Leaders" : "Game Leaders"}
        </HeadingTwo>

        <View style={styles.wrapper}>
          <View style={global.emptyContainer}>
            <Text style={global.errorText}>Failed to load leaders</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!hasAnyLeaders) {
    return null;
  }

  const teams = [
    {
      side: "AWAY",
      logo: awayLogo,
      player: getTopPlayer(resolvedTeams.away, selectedCategory),
    },
    {
      side: "HOME",
      logo: homeLogo,
      player: getTopPlayer(resolvedTeams.home, selectedCategory),
    },
  ];

  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {isScheduled ? "Season Leaders" : "Game Leaders"}
      </HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={tabs}
          selected={selectedCategory}
          onTabPress={(category) => setSelectedCategory(category as Category)}
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
                fontFamily: Fonts.REGULAR,
              }}
            >
              {CATEGORY_CONFIG[tab as Category].label.toUpperCase()}
            </Text>
          )}
        />

        {teams.map(({ side, logo, player }) => (
          <View key={side} style={styles.card}>
            <View style={styles.avatarWrapper}>
              <Image
                source={normalizeImageSource(player.headshot)}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            <View style={styles.infoSection}>
              <View style={styles.nameRow}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.fullName}
                </Text>

                {player.jersey && (
                  <Text style={styles.jersey}>#{player.jersey}</Text>
                )}
              </View>

              <View style={styles.statRow}>
                {player.stats.map((stat) => (
                  <Stat key={stat.label} stat={stat} styles={styles} />
                ))}
              </View>
            </View>

            {logo && (
              <Image
                source={normalizeImageSource(logo)}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
