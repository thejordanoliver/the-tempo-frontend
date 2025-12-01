// components/CFB/CFBGameLeaders.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import ScrollableTabBar from "components/TabBars/ScrollableTabBar";
import { players } from "constants/cfbPlayers";
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

const createEmptyPlayer = (teamId: string, category: Category): DisplayPlayer => ({
  id: -1,
  name: "-",
  image: "",
  teamId,
  teamAbbr: getCFBTeamAbbreviation(teamId) || "UNK",
  group: category,
  statistics: STAT_KEYS[category].map((key) => ({
    name: key,
    value: "-",
  })),
});

const normalizePlayers = (
  rawPlayers: CFBPlayer[] | undefined,
  fallbackTeamId: string
): DisplayPlayer[] =>
  (rawPlayers ?? []).map((p) => {
    const teamId = p.team?.id ? String(p.team.id) : fallbackTeamId;
    const teamAbbr = getCFBTeamAbbreviation(teamId) || "UNK";
    const originalPlayer = players.find((pl) => pl.id === Number(p.id));

    return {
      id: Number(p.id),
      name: p.name,
      image: originalPlayer?.image ?? "", // 👈 image or empty
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
  const map: Record<string, string> = {
    "comp att": "COMP/ATT",
    yards: "YDS",
    "passing touch downs": "TDS",
    interceptions: "INTS",
    "total rushes": "ATT",
    average: "AVG",
    "rushing touch downs": "TDS",
    "total receptions": "REC",
    "receiving touch downs": "TDS",
    tackles: "TKS",
    sacks: "SACKS",
    tfl: "TFL",
    ff: "FF",
    "field goals": "FG",
    pct: "PCT",
    long: "LNG",
    pat: "PAT",
    "extra point": "PAT",
    total: "TOT",
    touchbacks: "TBS",
  };

  return map[lower] || name.toUpperCase();
};

export default function CFBGameLeaders({
  gameId,
  homeTeamId,
  awayTeamId,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");
  const styles = getStyles(isDark, lighter);

  const textColor = lighter ? "#fff" : isDark ? "#fff" : "#1d1d1d";
  const subTextColor = lighter ? "#ccc" : isDark ? "#888" : "#555";
  const borderColor = lighter ? "#aaa" : isDark ? "#888" : "#ccc";

  const safeHomeId = homeTeamId ?? "";
  const safeAwayId = awayTeamId ?? "";

  const teamLogos = useMemo(() => {
    const logos: Record<string, any> = {};
    [safeHomeId, safeAwayId].forEach((id) => {
      if (!id) return;
      const abbr = getCFBTeamAbbreviation(id) || "UNK";
      logos[id] =
        isDark || lighter
          ? getTeamLogo(abbr, true) ?? getTeamLogo(abbr, false)
          : getTeamLogo(abbr, false) ?? getTeamLogo(abbr, true);
    });
    return logos;
  }, [safeHomeId, safeAwayId, isDark, lighter]);

  const homeResult = useCFBGameLeaders(gameId, safeHomeId);
  const awayResult = useCFBGameLeaders(gameId, safeAwayId);

  const { leaders: homePlayers, isLoading: loadingHome, isError: errorHome } =
    homeResult;

  const { leaders: awayPlayers, isLoading: loadingAway, isError: errorAway } =
    awayResult;

  if (!homeTeamId || !awayTeamId) {
    return (
      <View style={styles.center}>
        <Text style={{ color: textColor }}>Team info unavailable</Text>
      </View>
    );
  }

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
      const homeLeader =
        homeDisplay.find((p) => p.group === category) ||
        createEmptyPlayer(homeTeamId, category);

      const awayLeader =
        awayDisplay.find((p) => p.group === category) ||
        createEmptyPlayer(awayTeamId, category);

      acc[category] = { home: homeLeader, away: awayLeader };
      return acc;
    }, {} as Record<Category, { home: DisplayPlayer; away: DisplayPlayer }>);
  }, [homeDisplay, awayDisplay, homeTeamId, awayTeamId]);

  const { home, away } = topLeaders[selectedCategory];

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      <View style={{ marginBottom: 12 }}>
        <ScrollableTabBar
          tabs={CATEGORIES}
          lighter={lighter}
          selected={selectedCategory}
          onTabPress={(t) => setSelectedCategory(t as Category)}
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
        const logo = teamLogos[teamId];

        const filteredStats = STAT_KEYS[selectedCategory]
          .map((key) =>
            p.statistics.find(
              (s) =>
                s.name.toLowerCase() === key.toLowerCase()
            )
          )
          .filter(Boolean) as PlayerStat[];

        return (
          <View
            key={`${teamId}-${selectedCategory}`}
            style={[
              styles.card,
              { borderBottomWidth: 1, borderBottomColor: borderColor },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              {p.image ? (
                <Image
                  source={{ uri: p.image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, ]} />
              )}
            </View>

            {/* Player Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.playerName, { color: textColor }]}>
                {p.name}
              </Text>

              <View style={styles.statRow}>
                {filteredStats.map((stat, idx) => (
                  <View style={styles.statBlock} key={idx}>
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
              source={logo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
        );
      })}
    </View>
  );
}
