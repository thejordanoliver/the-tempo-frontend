// components/NFL/NFLGameLeaders.tsx
import Placeholder from "assets/images/placeholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Fonts } from "constants/fonts";
import { players } from "constants/nflPlayers";
import { getNFLTeamsLogo, getTeamAbbreviation } from "constants/teamsNFL";
import { NFLPlayer, useNFLGameLeaders } from "hooks/NFLHooks/useNFLGameLeaders";
import { getStyles } from "styles/GameDetailStyles/GameLeaders.styles";

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  useColorScheme,
  View,
} from "react-native";
import ScrollableTabBar from "../../TabBars/ScrollableTabBar";
import { Colors } from "constants/Colors";
const CATEGORIES = [
  "Passing",
  "Rushing",
  "Receiving",
  "Defensive",
  "Kicking",
  "Punting",
] as const;
type Category = (typeof CATEGORIES)[number];

type Props = {
  gameId: string;
  homeTeamId?: string;
  awayTeamId?: string;
  lighter?: boolean;
};

type PlayerStat = { name: string; value: string | number | null };
type DisplayPlayer = {
  id: number;
  name: string;
  image: string;
  teamId: string;
  teamAbbr: string;
  group: Category;
  statistics: PlayerStat[];
};

// ✅ Limit to 4 core stats per category
const STAT_KEYS: Record<Category, string[]> = {
  Passing: ["Comp Att", "Yards", "Passing Touch Downs", "Interceptions"],
  Rushing: ["Total Rushes", "Yards", "Average", "Rushing Touch Downs"],
  Receiving: ["Total Receptions", "Receiving Touch Downs", "Average", "Yards"],
  Defensive: ["Tackles", "Sacks", "TFL", "FF"],
  Kicking: ["Field Goals", "PCT", "Long", "PAT"],
  Punting: ["Total", "Yards", "Average", "Touchbacks"],
};

const findLocalPlayer = (id: number, name: string) => {
  return (
    players.find(
      (p) =>
        p.id === id || p.name.trim().toLowerCase() === name.trim().toLowerCase()
    ) || null
  );
};



// ✅ Normalize raw NFLPlayer to DisplayPlayer
const normalizePlayers = (
  players: NFLPlayer[] | undefined,
  teamIdProp: string
): DisplayPlayer[] =>
  (players ?? []).map((p) => {
    const teamAbbr = getTeamAbbreviation(teamIdProp) || "UNK";

    const local = findLocalPlayer(Number(p.id), p.name);

    return {
      id: Number(p.id),
      name: p.name,
      image: local?.image
        ? // support both require() and remote URL
          typeof local.image === "string"
          ? { uri: local.image }
          : local.image
        : (p as any).image ?? "",
      teamId: teamIdProp,
      teamAbbr,
      group: p.group as Category,
      statistics:
        p.stats?.map((s) => ({
          name: s.name,
          value: s.value,
        })) ?? [],
    };
  });

// ✅ Abbreviate stat headers by category
const getAbbreviation = (category: Category, name: string) => {
  const lower = name.toLowerCase();
  if (category === "Passing") {
    if (lower === "comp att") return "COMP/ATT";
    if (lower === "yards") return "YDS";
    if (lower === "passing touch downs") return "TDS";
    if (lower === "interceptions") return "INTS";
  }
  if (category === "Rushing") {
    if (lower === "total rushes") return "ATT";
    if (lower === "yards") return "YDS";
    if (lower === "average") return "AVG";
    if (lower === "rushing touch downs") return "TDS";
  }
  if (category === "Receiving") {
    if (lower === "total receptions") return "REC";
    if (lower === "receiving touch downs") return "TDS";
    if (lower === "average") return "AVG";
    if (lower === "yards") return "YDS";
  }
  if (category === "Defensive") {
    if (lower === "tackles") return "TKS";
    if (lower === "sacks") return "SACKS";
    if (lower === "tfl") return "TFL";
    if (lower === "ff") return "FF";
  }
  if (category === "Kicking") {
    if (lower === "field goals") return "FG";
    if (lower === "pct") return "PCT";
    if (lower === "long") return "LNG";
    if (lower === "extra point") return "PAT";
  }
  if (category === "Punting") {
    if (lower === "total") return "TOT";
    if (lower === "yards") return "YDS";
    if (lower === "average") return "AVG";
    if (lower === "touchbacks") return "TBS";
  }

  return name.toUpperCase();
};

export default function NFLGameLeaders({
  gameId,
  homeTeamId,
  awayTeamId,
  lighter = false
}: Props) {
  // ✅ Bail early if no teams provided
  if (!homeTeamId || !awayTeamId) {
    return null;
  }

  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");
  const styles = getStyles(isDark, lighter);

  const textColor = lighter ? Colors.white : isDark ? Colors.white : Colors.black;
  const subTextColor = lighter ? Colors.lightGray : isDark ? Colors.midTone : Colors.midTone;
  const borderColor = lighter ? Colors.lightGray : isDark ? Colors.darkGray : Colors.lightGray;

  const {
    leaders: homePlayers,
    isLoading: loadingHome,
    isError: errorHome,
  } = useNFLGameLeaders(gameId, homeTeamId);

  const {
    leaders: awayPlayers,
    isLoading: loadingAway,
    isError: errorAway,
  } = useNFLGameLeaders(gameId, awayTeamId);

  const homeDisplay = useMemo(
    () => normalizePlayers(homePlayers, homeTeamId),
    [homePlayers, homeTeamId]
  );
  const awayDisplay = useMemo(
    () => normalizePlayers(awayPlayers, awayTeamId),
    [awayPlayers, awayTeamId]
  );



  const topLeaders = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = {
        home: homeDisplay.find((p) => p.group === category) || null,
        away: awayDisplay.find((p) => p.group === category) || null,
      };
      return acc;
    }, {} as Record<Category, { home: DisplayPlayer | null; away: DisplayPlayer | null }>);
  }, [homeDisplay, awayDisplay]);

  if (loadingHome || loadingAway) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (errorHome || errorAway) {
    return (
      <View style={styles.center}>
        <Text style={[styles.error, { color: textColor }]}>
          Failed to load game leaders
        </Text>
      </View>
    );
  }

  const { home, away } = topLeaders[selectedCategory];

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      {/* Category Tabs */}
      <View style={{ marginBottom: 12 }}>
        <ScrollableTabBar
          tabs={CATEGORIES}
          lighter={lighter}
          selected={selectedCategory}
          onTabPress={(tab) => setSelectedCategory(tab as Category)}
          renderLabel={(tab, isSelected) => (
            <Text
              style={{
                fontFamily: Fonts.OSMEDIUM,
                fontSize: 14,
                color: isSelected ? textColor : subTextColor,
              }}
            >
              {tab}
            </Text>
          )}
        />
      </View>

      {[away, home].map((p) => {
        if (!p) return null;

        // ✅ Show light logos in dark mode or when lighter prop is true
        const useLightLogo = lighter || isDark;
        const logo = getNFLTeamsLogo(p.teamAbbr, useLightLogo);

        const filteredStats = STAT_KEYS[selectedCategory]
          .map((key) =>
            p.statistics.find((s) => s.name.toLowerCase() === key.toLowerCase())
          )
          .filter(Boolean) as PlayerStat[];

        return (
          <View
            key={p.id.toString()}
            style={[
              styles.card,
              { borderBottomWidth: 1, borderBottomColor: borderColor },
            ]}
          >
            {/* Avatar */}
            <View
              style={styles.avatarWrapper}
            >
              <Image
                source={p.image ? p.image : Placeholder}
                style={styles.avatar}
              />
            </View>

            {/* Player Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.playerName, { color: textColor }]}>
                {p.name}
              </Text>

              {/* Stats */}
              <View style={styles.statRow}>
                {filteredStats.map((stat, idx2) => (
                  <View style={styles.statBlock} key={idx2}>
                    <Text style={[styles.statLabel, { color: subTextColor }]}>
                      {getAbbreviation(selectedCategory, stat.name)}
                    </Text>
                    <Text style={[styles.statText, { color: textColor }]}>
                      {stat.value ?? "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Team Logo */}
            <Image source={logo} style={styles.teamLogo} resizeMode="contain" />
          </View>
        );
      })}
    </View>
  );
}
