import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { LeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

type TeamId = string | number;

type BaseballCategory =
  | "avg"
  | "homeRuns"
  | "RBIs"
  | "ERA"
  | "wins"
  | "strikeouts";

type TeamIdField = "id" | "espnId";

type BaseballLeaderStatistic = {
  name: string;
  displayName?: string | null;
  shortDisplayName?: string | null;
  abbreviation?: string | null;
  value?: string | number | null;
  displayValue?: string | null;
};

type BaseballLeaderAthlete = {
  id?: string | number | null;
  espnId?: string | number | null;
  teamId?: string | number | null;
  teamEspnId?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  shortName?: string | null;
  headshot?: string | null;
  jersey?: string | null;
  position?: string | null;
};

type BaseballLeaderEntry = {
  displayValue?: string | null;
  value?: string | number | null;
  mainStat?: {
    value?: string | number | null;
    displayValue?: string | null;
  } | null;
  athlete: BaseballLeaderAthlete;
  statistics?: BaseballLeaderStatistic[];
};

type BaseballLeaderCategory = {
  name: string;
  displayName?: string | null;
  leaders: BaseballLeaderEntry[];
};

type BaseballLeaderTeam = {
  team: {
    id: string | number;
    espnId?: string | number | null;
    displayName?: string | null;
    abbreviation?: string | null;
    logo?: string | null;
  };
  leaders: BaseballLeaderCategory[];
};

type DisplayStat = {
  label: string;
  value: string | number;
};

type DisplayPlayer = {
  fullName: string;
  headshot: ImageSourcePropType | string | null;
  jersey: string | null;
  position: string | null;
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
  away: BaseballLeaderTeam | undefined;
  home: BaseballLeaderTeam | undefined;
};

type Props = {
  leaders: BaseballLeaderTeam[];
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

const BASEBALL_CATEGORIES: BaseballCategory[] = [
  "avg",
  "homeRuns",
  "RBIs",
  "ERA",
  "wins",
  "strikeouts",
];

const CATEGORY_CONFIG: Record<BaseballCategory, CategoryConfig> = {
  avg: {
    label: "AVG",
    stats: [
      { label: "AVG", key: "avg" },
      { label: "OBP", key: "onBasePct" },
      { label: "SLG", key: "slugAvg" },
    ],
  },

  homeRuns: {
    label: "Home Runs",
    stats: [
      { label: "HR", key: "homeRuns" },
      { label: "AVG", key: "avg" },
      { label: "RBI", key: "RBIs" },
    ],
  },

  RBIs: {
    label: "RBIs",
    stats: [
      { label: "RBI", key: "RBIs" },
      { label: "HR", key: "homeRuns" },
      { label: "AVG", key: "avg" },
    ],
  },

  ERA: {
    label: "ERA",
    stats: [
      { label: "ERA", key: "ERA" },
      { label: "W", key: "wins" },
      { label: "K", key: "strikeouts" },
    ],
  },

  wins: {
    label: "Wins",
    stats: [
      { label: "W", key: "wins" },
      { label: "ERA", key: "ERA" },
      { label: "K", key: "strikeouts" },
    ],
  },

  strikeouts: {
    label: "Strikeouts",
    stats: [
      { label: "K", key: "strikeouts" },
      { label: "W", key: "wins" },
      { label: "ERA", key: "ERA" },
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
  leaders: BaseballLeaderTeam[],
  teamId: TeamId,
  field: TeamIdField,
): BaseballLeaderTeam | undefined {
  return leaders.find((group) => idsMatch(group.team[field], teamId));
}

function resolveUsingField(
  leaders: BaseballLeaderTeam[],
  awayId: TeamId,
  homeId: TeamId,
  field: TeamIdField,
): ResolvedLeaderTeams | null {
  const away = findTeamGroup(leaders, awayId, field);
  const home = findTeamGroup(leaders, homeId, field);

  if (!away || !home || away === home) {
    return null;
  }

  return {
    away,
    home,
  };
}

function resolveLeaderTeams(
  leaders: BaseballLeaderTeam[],
  awayId: TeamId,
  homeId: TeamId,
): ResolvedLeaderTeams {
  /*
   * Prefer database IDs first so a database ID cannot accidentally
   * match another team's ESPN ID.
   */
  const databaseIdMatch = resolveUsingField(leaders, awayId, homeId, "id");

  if (databaseIdMatch) {
    return databaseIdMatch;
  }

  /*
   * If the caller passed ESPN IDs, resolve both teams using ESPN IDs.
   */
  const espnIdMatch = resolveUsingField(leaders, awayId, homeId, "espnId");

  if (espnIdMatch) {
    return espnIdMatch;
  }

  /*
   * Fallback for mixed ID sources.
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
      return {
        away,
        home,
      };
    }
  }

  return {
    away: awayCandidates[0],
    home: homeCandidates.find((candidate) => candidate !== awayCandidates[0]),
  };
}

function getStatValue(
  entry: BaseballLeaderEntry,
  statName: string,
  isPrimaryStat: boolean,
): string | number {
  const statistic = entry.statistics?.find((stat) => stat.name === statName);

  if (
    statistic?.displayValue !== undefined &&
    statistic.displayValue !== null &&
    statistic.displayValue !== ""
  ) {
    return statistic.displayValue;
  }

  if (statistic?.value !== undefined && statistic.value !== null) {
    return statistic.value;
  }

  /*
   * ESPN sometimes leaves the statistics array empty for the
   * primary leader but still provides displayValue/value directly
   * on the leader entry.
   */
  if (isPrimaryStat) {
    if (entry.mainStat?.displayValue) {
      return entry.mainStat.displayValue;
    }

    if (entry.mainStat?.value !== undefined && entry.mainStat.value !== null) {
      return entry.mainStat.value;
    }

    if (
      entry.displayValue !== undefined &&
      entry.displayValue !== null &&
      entry.displayValue !== ""
    ) {
      return entry.displayValue;
    }

    if (entry.value !== undefined && entry.value !== null) {
      return entry.value;
    }
  }

  return "–";
}

function createPlaceholder(category: BaseballCategory): DisplayPlayer {
  return {
    fullName: "Unknown Player",
    headshot: Placeholder,
    jersey: null,
    position: null,
    stats: CATEGORY_CONFIG[category].stats.map(({ label }) => ({
      label,
      value: "–",
    })),
  };
}

function getTopPlayer(
  teamGroup: BaseballLeaderTeam | undefined,
  category: BaseballCategory,
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
      leader.athlete.fullName ||
      leader.athlete.displayName ||
      leader.athlete.shortName ||
      "Unknown Player",

    headshot: leader.athlete.headshot ?? null,

    jersey: leader.athlete.jersey ?? null,

    position: leader.athlete.position ?? null,

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
  const [selectedCategory, setSelectedCategory] =
    useState<BaseballCategory>("avg");

  const styles = LeadersStyles(isDark);
  const global = globalStyles(isDark);

  const resolvedTeams = useMemo(
    () => resolveLeaderTeams(leaders, awayId, homeId),
    [leaders, awayId, homeId],
  );

  const availableCategories = useMemo(() => {
    return BASEBALL_CATEGORIES.filter((category) =>
      leaders.some((teamGroup) =>
        teamGroup.leaders.some(
          (categoryGroup) =>
            categoryGroup.name === category && categoryGroup.leaders.length > 0,
        ),
      ),
    );
  }, [leaders]);

  /*
   * If AVG isn't available for a particular response, select the
   * first category ESPN actually returned.
   */
  const activeCategory = availableCategories.includes(selectedCategory)
    ? selectedCategory
    : availableCategories[0];

  if (error) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>
          {state === "pre" ? "Season Leaders" : "Team Leaders"}
        </HeadingTwo>

        <View style={styles.wrapper}>
          <View style={global.emptyContainer}>
            <Text style={global.errorText}>Failed to load leaders</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!activeCategory || availableCategories.length === 0) {
    return null;
  }

  const teams = [
    {
      side: "AWAY",
      logo: awayLogo,
      player: getTopPlayer(resolvedTeams.away, activeCategory),
    },
    {
      side: "HOME",
      logo: homeLogo,
      player: getTopPlayer(resolvedTeams.home, activeCategory),
    },
  ];

  return (
    <View>
      <HeadingTwo isDark={isDark}>
        {state === "pre" ? "Season Leaders" : "Team Leaders"}
      </HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={availableCategories}
          selected={activeCategory}
          onTabPress={(category) =>
            setSelectedCategory(category as BaseballCategory)
          }
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
              {CATEGORY_CONFIG[tab as BaseballCategory].label.toUpperCase()}
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
