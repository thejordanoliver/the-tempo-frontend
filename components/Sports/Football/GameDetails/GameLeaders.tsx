// components/Sports/Football/GameDetails/GameLeaders.tsx

import {
  Athlete,
  FootballLeaderCategory,
  FootballLeaderEntry,
  FootballTeamLeaders,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

const GAME_CATEGORIES = [
  "Passing",
  "Rushing",
  "Receiving",
  "Defensive",
  "Kicking",
  "Punting",
] as const;

type Category = (typeof GAME_CATEGORIES)[number];

type Side = "away" | "home";

type Props = {
  leaders: FootballTeamLeaders[] | undefined;
  awayLogo: ImageSourcePropType | null;
  homeLogo: ImageSourcePropType | null;
  awayCode: string;
  homeCode: string;
  homeId: string | number;
  awayId: string | number;
  isDark: boolean;
  league: string;
  state?: string;
  loading?: boolean;
  error?: boolean;
};

type DisplayLeader = {
  side: Side;
  category: FootballLeaderCategory;
  entry: FootballLeaderEntry;
};

const CATEGORY_KEYS: Record<Category, string[]> = {
  Passing: ["passingYards"],
  Rushing: ["rushingYards"],
  Receiving: ["receivingYards"],
  Defensive: ["totalTackles", "sacks", "interceptions", "defensive"],
  Kicking: ["fieldGoalsMade", "fieldGoals", "kickingPoints", "extraPointsMade"],
  Punting: ["puntYards", "punts", "grossAvgPuntYards"],
};

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function idsMatch(
  first: string | number | null | undefined,
  second: string | number | null | undefined,
): boolean {
  if (
    first === null ||
    first === undefined ||
    second === null ||
    second === undefined
  ) {
    return false;
  }

  return String(first) === String(second);
}

function findTeamLeaders(
  leaders: FootballTeamLeaders[],
  teamId: string | number,
  teamCode: string,
): FootballTeamLeaders | undefined {
  const normalizedCode = normalizeValue(teamCode);

  return leaders.find((teamLeaders) => {
    const team = teamLeaders.team;

    return (
      idsMatch(team?.id, teamId) ||
      idsMatch(team?.espnId, teamId) ||
      normalizeValue(team?.abbreviation) === normalizedCode
    );
  });
}

function findCategory(
  teamLeaders: FootballTeamLeaders | undefined,
  category: Category,
): FootballLeaderCategory | undefined {
  if (!teamLeaders?.leaders?.length) {
    return undefined;
  }

  const categoryKeys = CATEGORY_KEYS[category];

  return categoryKeys
    .map((key) =>
      teamLeaders.leaders.find((leaderCategory) => leaderCategory.name === key),
    )
    .find(Boolean);
}

function hasCategoryLeaders(
  teamLeaders: FootballTeamLeaders | undefined,
  category: Category,
): boolean {
  const leaderCategory = findCategory(teamLeaders, category);

  return Boolean(leaderCategory?.leaders?.length);
}

function getHeadshotSource(headshot: Athlete["headshot"]): ImageSourcePropType {
  if (!headshot) {
    return Placeholder;
  }

  if (typeof headshot === "string") {
    return {
      uri: headshot,
    };
  }

  if (headshot.href) {
    return {
      uri: headshot.href,
    };
  }

  return Placeholder;
}

function Stat({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string | number;
  isDark: boolean;
}) {
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

function LeaderStats({
  category,
  entry,
  isDark,
}: {
  category: FootballLeaderCategory;
  entry: FootballLeaderEntry;
  isDark: boolean;
}) {
  const mainStatLabel = entry.mainStat?.label ?? category.displayName ?? "STAT";

  const mainStatValue = entry.mainStat?.value ?? entry.value ?? "–";

  const summary = entry.summary?.trim() || entry.displayValue?.trim() || "";

  return (
    <>
      <Stat label={mainStatLabel} value={mainStatValue} isDark={isDark} />

      {summary ? (
        <Stat label="SUMMARY" value={summary} isDark={isDark} />
      ) : null}
    </>
  );
}

export default function GameLeaders({
  leaders,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  homeId,
  awayId,
  isDark,
  state,
  league,
  loading = false,
  error = false,
}: Props) {
  const styles = gameLeadersStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");

  const normalizedLeaders = useMemo(
    () => (Array.isArray(leaders) ? leaders : []),
    [leaders],
  );

  const awayTeamLeaders = useMemo(
    () => findTeamLeaders(normalizedLeaders, awayId, awayCode),
    [normalizedLeaders, awayId, awayCode],
  );

  const homeTeamLeaders = useMemo(
    () => findTeamLeaders(normalizedLeaders, homeId, homeCode),
    [normalizedLeaders, homeId, homeCode],
  );

  const availableCategories = useMemo(
    () =>
      GAME_CATEGORIES.filter(
        (category) =>
          hasCategoryLeaders(awayTeamLeaders, category) ||
          hasCategoryLeaders(homeTeamLeaders, category),
      ),
    [awayTeamLeaders, homeTeamLeaders],
  );

  useEffect(() => {
    if (!availableCategories.length) {
      return;
    }

    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory, state]);

  const displayedLeaders = useMemo(() => {
    const result: DisplayLeader[] = [];

    const awayCategory = findCategory(awayTeamLeaders, selectedCategory);

    const awayEntry = awayCategory?.leaders?.[0];

    if (awayCategory && awayEntry) {
      result.push({
        side: "away",
        category: awayCategory,
        entry: awayEntry,
      });
    }

    const homeCategory = findCategory(homeTeamLeaders, selectedCategory);

    const homeEntry = homeCategory?.leaders?.[0];

    if (homeCategory && homeEntry) {
      result.push({
        side: "home",
        category: homeCategory,
        entry: homeEntry,
      });
    }

    return result;
  }, [awayTeamLeaders, homeTeamLeaders, selectedCategory]);

  if (error) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>

        <View style={styles.wrapper}>
          <View style={global.emptyContainer}>
            <Text style={global.errorText}>Failed to load leaders</Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return <GameLeadersSkeleton />;
  }

  if (state !== "in" && state !== "post") {
    return null;
  }

  if (!availableCategories.length) {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={availableCategories}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          isDark={isDark}
        />

        {displayedLeaders.map(({ side, category, entry }) => {
          const isAway = side === "away";
          const teamLogo = isAway ? awayLogo : homeLogo;
          const teamId = isAway ? awayId : homeId;
          const player = entry.athlete;

          const playerName = player.shortName ?? "Unknown Player";

          const jersey = `#${player.jersey}` || `N/A`;

          const handlePress = () => {
            if (!player.id) {
              return;
            }

            router.push({
              pathname: "/player/football/[id]",
              params: {
                id: String(player.id),
                teamId: String(teamId),
                league,
              },
            });
          };

          return (
            <Pressable
              key={player.id}
              onPress={handlePress}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={getHeadshotSource(player.headshot)}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={styles.playerName}>{playerName}</Text>

                    {jersey ? (
                      <Text style={styles.jersey}>{jersey}</Text>
                    ) : null}
                  </View>

                  <View style={styles.statRow}>
                    <LeaderStats
                      category={category}
                      entry={entry}
                      isDark={isDark}
                    />
                  </View>
                </View>

                {teamLogo ? (
                  <Image
                    source={teamLogo}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
