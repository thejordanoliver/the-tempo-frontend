// components/CFB/CFBGameLeaders.tsx
import Placeholder from "assets/images/placeholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import ScrollableTabBar from "components/NFL/TabBars/ScrollableTabBar";
import { Fonts } from "constants/fonts";
import { getCFBTeamAbbreviation, getTeamLogo } from "constants/teamsCFB";
import { CFBPlayer, useCFBGameLeaders } from "hooks/CFBHooks/useCFBGameLeaders";

import { getStyles } from "styles/GameDetailStyles/GameLeaders.styles";

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  useColorScheme,
  View,
} from "react-native";

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

const STAT_KEYS: Record<Category, string[]> = {
  Passing: ["Comp Att", "Yards", "Passing Touch Downs", "Interceptions"],
  Rushing: ["Total Rushes", "Yards", "Average", "Rushing Touch Downs"],
  Receiving: ["Total Receptions", "Receiving Touch Downs", "Average", "Yards"],
  Defensive: ["Tackles", "Sacks", "TFL", "FF"],
  Kicking: ["Field Goals", "PCT", "Long", "PAT"],
  Punting: ["Total", "Yards", "Average", "Touchbacks"],
};

// Normalize raw CFBPlayer to DisplayPlayer and use real player teamAbbr if available
const normalizePlayers = (
  players: CFBPlayer[] | undefined,
  fallbackTeamId: string
): DisplayPlayer[] =>
  (players ?? []).map((p) => {
    const teamId = p.team?.id ? String(p.team.id) : fallbackTeamId;
    const teamAbbr = getCFBTeamAbbreviation(teamId) || "UNK";

    return {
      id: Number(p.id),
      name: p.name,
      image: (p as any).image ?? "",
      teamId,
      teamAbbr,
      group: p.group as Category,
      statistics:
        p.stats?.map((s) => ({
          name: s.name,
          value: s.value,
        })) ?? [],
    };
  });

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

export default function CFBGameLeaders({
  gameId,
  homeTeamId,
  awayTeamId,
  lighter,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");
  const styles = getStyles(isDark);

  const textColor = lighter ? "#fff" : isDark ? "#fff" : "#1d1d1d";
  const subTextColor = lighter ? "#ccc" : isDark ? "#888" : "#555";
  const borderColor = lighter ? "#aaa" : isDark ? "#888" : "#ccc";

const teamLogos = useMemo(() => {
  if (!homeTeamId || !awayTeamId) return {};

  const logos: Record<string, any> = {};
  [homeTeamId, awayTeamId].forEach((id) => {
    const teamAbbr = getCFBTeamAbbreviation(id) || "UNK";

    // Use light logo only in dark mode or lighter mode
    if (isDark || lighter) {
      logos[id] = getTeamLogo(teamAbbr, true) ?? getTeamLogo(teamAbbr, false);
    } else {
      logos[id] = getTeamLogo(teamAbbr, false) ?? getTeamLogo(teamAbbr, true);
    }
  });

  return logos;
}, [homeTeamId, awayTeamId, isDark, lighter]);

  // Early return
  if (!homeTeamId || !awayTeamId) return null;

  const {
    leaders: homePlayers,
    isLoading: loadingHome,
    isError: errorHome,
  } = useCFBGameLeaders(gameId, homeTeamId);

  const {
    leaders: awayPlayers,
    isLoading: loadingAway,
    isError: errorAway,
  } = useCFBGameLeaders(gameId, awayTeamId);

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

      {[
        { p: away, teamId: awayTeamId },
        { p: home, teamId: homeTeamId },
      ].map(({ p, teamId }) => {
        if (!p) return null;

        const logo = teamId ? teamLogos[teamId] : null;

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
            <View
              style={[styles.avatarWrapper]}
            >
              <Image
                source={p.image ? { uri: p.image } : Placeholder}
                style={styles.avatar}
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.playerName, { color: textColor }]}>
                {p.name}
              </Text>

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

          <Image
  source={teamLogos[teamId]}
  style={styles.teamLogo}
  resizeMode="contain"
/>

          </View>
        );
      })}
    </View>
  );
}
