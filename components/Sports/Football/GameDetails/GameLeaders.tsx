// components/nfl/GameLeaders.tsx
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

type FootballMappedStat = {
  key: string;
  label: string;
  description?: string;
  value: string;
};

type FootballPlayerStatRow = {
  id: string;
  uid?: string;
  guid?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  shortName?: string;
  jersey?: string;
  headshot?:
    | string
    | {
        href?: string;
        alt?: string;
      };

  teamId: number | string | null;
  teamEspnId: number | string | null;

  category: string;
  categoryLabel: string;

  labels: string[];
  keys: string[];
  descriptions: string[];
  stats: string[];

  mappedStats: FootballMappedStat[];
};

type FootballPlayersByCategory = Record<
  string,
  {
    away: FootballPlayerStatRow[];
    home: FootballPlayerStatRow[];
  }
>;

type Props = {
  playersByCategory: FootballPlayersByCategory;
  awayLogo: ImageSourcePropType | null;
  homeLogo: ImageSourcePropType | null;
  awayCode: string;
  homeCode: string;
  homeId: number;
  awayId: number;
  isDark: boolean;
  league: string;
  state?: string;
  loading?: boolean;
  error?: boolean;
};

type DisplayPlayer = {
  category: Category;
  side: "away" | "home";
  isPlaceholder: boolean;
  player?: FootballPlayerStatRow | null;
};

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

const CATEGORY_TO_BOX_SCORE_NAME: Record<Category, string> = {
  Passing: "passing",
  Rushing: "rushing",
  Receiving: "receiving",
  Defensive: "defensive",
  Kicking: "kicking",
  Punting: "punting",
};

const DEFENSIVE_FALLBACKS = ["defensive", "totalTackles", "interceptions"];

function getHeadshotSource(
  headshot?:
    | string
    | {
        href?: string;
        alt?: string;
      },
): ImageSourcePropType | string | null {
  if (!headshot) return Placeholder;

  if (typeof headshot === "string") {
    return headshot;
  }

  return headshot.href ?? Placeholder;
}

function makePlaceholder(
  category: Category,
  side: "away" | "home",
): DisplayPlayer {
  return {
    category,
    side,
    isPlaceholder: true,
    player: null,
  };
}

function getCategoryData(
  playersByCategory: FootballPlayersByCategory,
  category: Category,
) {
  const boxScoreName = CATEGORY_TO_BOX_SCORE_NAME[category];

  if (category !== "Defensive") {
    return playersByCategory[boxScoreName] ?? { away: [], home: [] };
  }

  for (const key of DEFENSIVE_FALLBACKS) {
    const data = playersByCategory[key];

    if (data?.away?.length || data?.home?.length) {
      return data;
    }
  }

  return { away: [], home: [] };
}

function getStatValue(player: FootballPlayerStatRow, key: string) {
  const found = player.mappedStats.find(
    (stat) =>
      stat.key.toLowerCase() === key.toLowerCase() ||
      stat.label.toLowerCase() === key.toLowerCase(),
  );

  return found?.value ?? "–";
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

function renderCategoryStats(
  category: Category,
  player: FootballPlayerStatRow | null | undefined,
  isDark: boolean,
) {
  if (!player) {
    switch (category) {
      case "Passing":
        return (
          <>
            <Stat label="CMP/ATT" value={"-"} isDark={isDark} />
            <Stat label="YDS" value={"-"} isDark={isDark} />
            <Stat label="TD" value={"-"} isDark={isDark} />
            <Stat label="INT" value={"-"} isDark={isDark} />
          </>
        );

      case "Rushing":
        return (
          <>
            <Stat label="CAR" value={"-"} isDark={isDark} />
            <Stat label="YDS" value={"-"} isDark={isDark} />
            <Stat label="AVG" value={"-"} isDark={isDark} />
            <Stat label="TD" value={"-"} isDark={isDark} />
          </>
        );

      case "Receiving":
        return (
          <>
            <Stat label="REC" value={"-"} isDark={isDark} />
            <Stat label="YDS" value={"-"} isDark={isDark} />
            <Stat label="AVG" value={"-"} isDark={isDark} />
            <Stat label="TD" value={"-"} isDark={isDark} />
          </>
        );

      case "Defensive":
        return (
          <>
            <Stat label="INT" value={"-"} isDark={isDark} />
            <Stat label="YDS" value={"-"} isDark={isDark} />
            <Stat label="TD" value={"-"} isDark={isDark} />
          </>
        );

      case "Kicking":
        return (
          <>
            <Stat label="FG" value={"-"} isDark={isDark} />
            <Stat label="PCT" value={"-"} isDark={isDark} />
            <Stat label="LONG" value={"-"} isDark={isDark} />
            <Stat label="XP" value={"-"} isDark={isDark} />
          </>
        );

      case "Punting":
        return (
          <>
            <Stat label="NO" value={"-"} isDark={isDark} />
            <Stat label="YDS" value={"-"} isDark={isDark} />
            <Stat label="AVG" value={"-"} isDark={isDark} />
            <Stat label="LONG" value={"-"} isDark={isDark} />
          </>
        );

      default:
        return null;
    }
  }

  switch (category) {
    case "Passing":
      return (
        <>
          <Stat
            label="CMP/ATT"
            value={getStatValue(player, "completions/passingAttempts")}
            isDark={isDark}
          />
          <Stat
            label="YDS"
            value={getStatValue(player, "passingYards")}
            isDark={isDark}
          />
          <Stat
            label="TD"
            value={getStatValue(player, "passingTouchdowns")}
            isDark={isDark}
          />
          <Stat
            label="INT"
            value={getStatValue(player, "interceptions")}
            isDark={isDark}
          />
        </>
      );

    case "Rushing":
      return (
        <>
          <Stat
            label="CAR"
            value={getStatValue(player, "rushingAttempts")}
            isDark={isDark}
          />
          <Stat
            label="YDS"
            value={getStatValue(player, "rushingYards")}
            isDark={isDark}
          />
          <Stat
            label="AVG"
            value={getStatValue(player, "yardsPerRushAttempt")}
            isDark={isDark}
          />
          <Stat
            label="TD"
            value={getStatValue(player, "rushingTouchdowns")}
            isDark={isDark}
          />
        </>
      );

    case "Receiving":
      return (
        <>
          <Stat
            label="REC"
            value={getStatValue(player, "receptions")}
            isDark={isDark}
          />
          <Stat
            label="YDS"
            value={getStatValue(player, "receivingYards")}
            isDark={isDark}
          />
          <Stat
            label="AVG"
            value={getStatValue(player, "yardsPerReception")}
            isDark={isDark}
          />
          <Stat
            label="TD"
            value={getStatValue(player, "receivingTouchdowns")}
            isDark={isDark}
          />
        </>
      );

    case "Defensive":
      return (
        <>
          <Stat
            label="INT"
            value={getStatValue(player, "interceptions")}
            isDark={isDark}
          />
          <Stat
            label="YDS"
            value={getStatValue(player, "interceptionYards")}
            isDark={isDark}
          />
          <Stat
            label="TD"
            value={getStatValue(player, "interceptionTouchdowns")}
            isDark={isDark}
          />
        </>
      );

    case "Kicking":
      return (
        <>
          <Stat
            label="FG"
            value={getStatValue(player, "fieldGoalsMade/fieldGoalAttempts")}
            isDark={isDark}
          />
          <Stat
            label="PCT"
            value={getStatValue(player, "fieldGoalPct")}
            isDark={isDark}
          />
          <Stat
            label="LONG"
            value={getStatValue(player, "longFieldGoalMade")}
            isDark={isDark}
          />
          <Stat
            label="XP"
            value={getStatValue(player, "extraPointsMade/extraPointAttempts")}
            isDark={isDark}
          />
        </>
      );

    case "Punting":
      return (
        <>
          <Stat
            label="NO"
            value={getStatValue(player, "punts")}
            isDark={isDark}
          />
          <Stat
            label="YDS"
            value={getStatValue(player, "puntYards")}
            isDark={isDark}
          />
          <Stat
            label="AVG"
            value={getStatValue(player, "grossAvgPuntYards")}
            isDark={isDark}
          />
          <Stat
            label="LONG"
            value={getStatValue(player, "longPunt")}
            isDark={isDark}
          />
        </>
      );

    default:
      return null;
  }
}

/* ----------------------------- */
/* Component                     */
/* ----------------------------- */

export default function GameLeaders({
  playersByCategory,
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
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");
  const styles = gameLeadersStyles(isDark);
  const global = globalStyles(isDark);
  const route = "/player/football/[id]";

  useEffect(() => {
    setSelectedCategory("Passing");
  }, [state]);

  const topPlayers = useMemo(() => {
    const data = getCategoryData(playersByCategory, selectedCategory);

    const awayPlayer = data.away?.[0] ?? null;
    const homePlayer = data.home?.[0] ?? null;

    return [
      awayPlayer
        ? {
            category: selectedCategory,
            side: "away" as const,
            isPlaceholder: false,
            player: awayPlayer,
          }
        : makePlaceholder(selectedCategory, "away"),
      homePlayer
        ? {
            category: selectedCategory,
            side: "home" as const,
            isPlaceholder: false,
            player: homePlayer,
          }
        : makePlaceholder(selectedCategory, "home"),
    ];
  }, [playersByCategory, selectedCategory]);

  if (error) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>
        <View style={styles.wrapper}>
          <MainScrollTabBar
            tabs={GAME_CATEGORIES}
            selected={selectedCategory}
            onTabPress={setSelectedCategory}
            isDark={isDark}
          />
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

  if (state !== "in" && state !== "post") return null;

  if (!Object.keys(playersByCategory ?? {}).length) {
    return null;
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={GAME_CATEGORIES}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          isDark={isDark}
        />

        {topPlayers.map((item) => {
          const isAwayRow = item.side === "away";
          const teamLogo = isAwayRow ? awayLogo : homeLogo;
          const teamCode = isAwayRow ? awayCode : homeCode;
          const sideLabel = isAwayRow ? "AWAY" : "HOME";
          const player = item.player;
          const playerId = item.player?.id;
          const playerName = player?.displayName || "N/A";
          const jersey = player?.jersey ?? "#";
          const headshot = item.isPlaceholder
            ? Placeholder
            : getHeadshotSource(player?.headshot);
          const teamId = isAwayRow ? awayId : homeId;

          const handlePress = () => {
            if (!route) {
              console.warn(`No player route configured for ${league}`);
              return;
            }

            if (!teamId) {
              console.warn(` No team found for "${homeCode}" in ${league}`);
              return;
            }

            router.push({
              pathname: route,
              params: {
                id: String(playerId),
                teamId: String(teamId),
                league,
              },
            });
          };

          return (
            <Pressable
              key={`${sideLabel}-${teamCode}-${selectedCategory}`}
              onPress={handlePress}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: headshot }} style={styles.avatar} />
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={styles.playerName}>{playerName}</Text>
                    <Text style={styles.jersey}>{jersey}</Text>
                  </View>

                  <View style={styles.statRow}>
                    {renderCategoryStats(selectedCategory, player, isDark)}
                  </View>
                </View>

                {teamLogo && (
                  <Image
                    source={teamLogo}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
