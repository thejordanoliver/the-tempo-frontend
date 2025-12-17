// components/NFL/GameLeaders.tsx
import Placeholder from "assets/images/placeholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";

import { players as cfbPlayers } from "constants/cfbPlayers";

import {
  getTeamCode as getCFBCode,
  getTeamLogo as getCFBLogo,
} from "constants/teamsCFB";
import { getNFLTeamsLogo } from "constants/teamsNFL";

import { useNFLGameLeaders } from "hooks/NFLHooks/useNFLGameLeaders";

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { getStyles } from "styles/GameDetailStyles/GameLeadersStyles";

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
  homeTeamId: string;
  awayTeamId: string;
  league: "NFL" | "CFB";
  lighter?: boolean;
};

type PlayerStat = { name: string; value: string | number | null };

type DisplayPlayer = {
  id: number;
  name: string;
  image: any;
  teamCode: string;
  group: Category;
  statistics: PlayerStat[];
};

// -------- Find player in correct DB --------
const findLocalPlayer = (id: number, name: string) => {
  const db = cfbPlayers;
  return (
    db.find(
      (p) =>
        p.id === id || p.name.trim().toLowerCase() === name.trim().toLowerCase()
    ) || null
  );
};

// -------- Normalize any raw leader to DisplayPlayer --------
const normalizePlayers = (raw: any[], teamId: string): DisplayPlayer[] => {
  const rawCode = getCFBCode(teamId);

  const teamCode: string = rawCode ?? "UNK";

  return raw.map((p) => {
    const id = Number(p.id);
    const local = findLocalPlayer(id, p.name);

    const image = local?.image
      ? typeof local.image === "string"
        ? { uri: local.image }
        : local.image
      : p.image || Placeholder;

    return {
      id,
      name: p.name,
      image,
      teamCode,
      group: p.group,
      statistics: p.stats ?? [],
    };
  });
};

const STAT_KEYS: Record<Category, string[]> = {
  Passing: ["Comp Att", "Yards", "Passing Touch Downs", "Interceptions"],
  Rushing: ["Total Rushes", "Yards", "Average", "Rushing Touch Downs"],
  Receiving: ["Total Receptions", "Receiving Touch Downs", "Average", "Yards"],
  Defensive: ["Tackles", "Sacks", "TFL", "FF"],
  Kicking: ["Field Goals", "PCT", "Long", "PAT"],
  Punting: ["Total", "Yards", "Average", "Touchbacks"],
};

const ABBR: Record<string, string> = {
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
  total: "TOT",
  touchbacks: "TBS",
};

const getAbbreviation = (name: string) =>
  ABBR[name.toLowerCase()] ?? name.toUpperCase();

export default function GameLeaders({
  gameId,
  homeTeamId,
  awayTeamId,
  league,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark, lighter);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");

  // ---- ALWAYS use NFL hook (API structure is same)
  const {
    leaders: rawHome,
    isLoading: loadingHome,
    isError: errorHome,
  } = useNFLGameLeaders(gameId, homeTeamId);

  const {
    leaders: rawAway,
    isLoading: loadingAway,
    isError: errorAway,
  } = useNFLGameLeaders(gameId, awayTeamId);

  // ---- Normalize depending on League
  const home = useMemo(
    () => normalizePlayers(rawHome ?? [], homeTeamId),
    [rawHome, league]
  );

  const away = useMemo(
    () => normalizePlayers(rawAway ?? [], awayTeamId),
    [rawAway, league]
  );

  const topLeaders = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = {
        home: home.find((p) => p.group === cat) ?? null,
        away: away.find((p) => p.group === cat) ?? null,
      };
      return acc;
    }, {} as Record<Category, { home: DisplayPlayer | null; away: DisplayPlayer | null }>);
  }, [home, away]);

  if (loadingHome || loadingAway)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  if (errorHome || errorAway)
    return <Text style={[styles.error]}>Failed to load leaders</Text>;

  const { home: homeP, away: awayP } = topLeaders[selectedCategory];

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
  const borderColor = lighter
    ? Colors.lightGray
    : isDark
    ? Colors.midTone
    : Colors.midTone;

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      <MainScrollTabBar
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

      {[awayP, homeP].map((p, i) => {
        if (!p) return null;

        // ------------- LOGO DECISION -------------
        const logo =
          league === "NFL"
            ? getNFLTeamsLogo(p.teamCode, isDark || lighter)
            : getCFBLogo(p.teamCode, isDark || lighter);

        // ------------- FILTER STATS -------------
        const statList = STAT_KEYS[selectedCategory]
          .map((key) =>
            p.statistics.find(
              (s) => s?.name?.toLowerCase() === key.toLowerCase()
            )
          )
          .filter((s): s is PlayerStat => !!s);

        return (
          <View
            key={i}
            style={[styles.card, { borderBottomColor: borderColor }]}
          >
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={p.image} style={styles.avatar} />
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.playerName, { color: textColor }]}>
                {p.name}
              </Text>

              <View style={styles.statRow}>
                {statList.map((s, idx) => (
                  <View style={styles.statBlock} key={idx}>
                    <Text style={[styles.statLabel, { color: subTextColor }]}>
                      {getAbbreviation(s.name)}
                    </Text>
                    <Text style={[styles.statText, { color: textColor }]}>
                      {s.value ?? "-"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Team Logo */}
            <Image source={logo} style={styles.teamLogo} />
          </View>
        );
      })}
    </View>
  );
}
