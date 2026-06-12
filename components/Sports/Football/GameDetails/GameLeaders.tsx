// components/nfl/GameLeaders.tsx
import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameLeadersSkeleton from "components/Skeletons/GameDetails/GameLeadersSkeleton";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
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
  awayLogo: ImageSourcePropType | string | null;
  homeLogo: ImageSourcePropType | string | null;
  awayCode: string;
  homeCode: string;
  isDark: boolean;
  gameStatusDescription: string;
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

function normalizeImageSource(
  source: ImageSourcePropType | string | null | undefined,
): ImageSourcePropType {
  if (!source) return Placeholder;

  if (typeof source === "string") {
    return { uri: source };
  }

  return source;
}

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

function getFirstName(player?: FootballPlayerStatRow | null) {
  if (player?.firstName) return player.firstName;

  const name =
    player?.displayName ||
    player?.fullName ||
    player?.shortName ||
    "Unknown Player";

  return name.split(" ")[0] || "Unknown";
}

function getLastName(player?: FootballPlayerStatRow | null) {
  if (player?.lastName) return player.lastName;

  const name =
    player?.displayName ||
    player?.fullName ||
    player?.shortName ||
    "Unknown Player";

  return name.split(" ").slice(1).join(" ") || "Player";
}

function isHiddenGameState(status: string) {
  return ["Scheduled", "Canceled", "Delayed", "Postponed"].includes(status);
}

function makePlaceholder(category: Category, side: "away" | "home"): DisplayPlayer {
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
    return (
      <>
        <Stat label="YDS" value="–" isDark={isDark} />
        <Stat label="STAT" value="–" isDark={isDark} />
      </>
    );
  }

  switch (category) {
    case "Passing":
      return (
        <>
          <Stat
            label="C/ATT"
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
          <Stat label="INT" value={getStatValue(player, "interceptions")} isDark={isDark} />
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
          <Stat label="NO" value={getStatValue(player, "punts")} isDark={isDark} />
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
  isDark,
  gameStatusDescription,
  loading = false,
  error = false,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");

  const styles = gameLeadersStyles(isDark);
  const global = globalStyles(isDark);

  useEffect(() => {
    setSelectedCategory("Passing");
  }, [gameStatusDescription]);

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

  const getLabel = (tab: Category) => tab.toUpperCase();

  if (error) {
    return <Text style={global.errorText}>Failed to load leaders</Text>;
  }

  if (loading) {
    return <GameLeadersSkeleton />;
  }

  if (isHiddenGameState(gameStatusDescription)) {
    return null;
  }

  if (!Object.keys(playersByCategory ?? {}).length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={GAME_CATEGORIES}
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

        {topPlayers.map((item) => {
          const isAwayRow = item.side === "away";
          const teamLogo = isAwayRow ? awayLogo : homeLogo;
          const teamCode = isAwayRow ? awayCode : homeCode;
          const sideLabel = isAwayRow ? "AWAY" : "HOME";
          const player = item.player;

          const firstName = item.isPlaceholder ? "Unknown" : getFirstName(player);
          const lastName = item.isPlaceholder ? "Player" : getLastName(player);
          const jersey = item.isPlaceholder ? "–" : (player?.jersey ?? "–");
          const headshot = item.isPlaceholder
            ? Placeholder
            : getHeadshotSource(player?.headshot);

          return (
            <View
              key={`${sideLabel}-${teamCode}-${selectedCategory}`}
              style={styles.card}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={normalizeImageSource(headshot)}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.playerName}>
                    {firstName} {lastName}
                  </Text>
                  <Text style={styles.jersey}>#{jersey}</Text>
                </View>

                <View style={styles.statRow}>
                  {renderCategoryStats(selectedCategory, player, isDark)}
                </View>
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