// components/NFL/GameLeaders.tsx
import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import GameLeadersSkeleton from "components/GameDetails/GameLeadersSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors, Fonts } from "constants/Styles";
import {
  getTeamCode as getCFBCode,
  getTeamLogo as getCFBLogo,
} from "constants/teamsCFB";
import { getTeamCode as getNFLCode, getNFLTeamsLogo } from "constants/teamsNFL";
import { useFootballGameLeaders } from "hooks/NFLHooks/useFootballGameLeaders";
import { useTeamPlayers } from "hooks/NFLHooks/useTeamPlayers";
import { useMemo, useState } from "react";
import { Image, Text, useColorScheme, View } from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";

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

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const findRosterPlayer = (roster: any[], id: number, name: string) => {
  if (!roster?.length) return null;

  return (
    roster.find(
      (p) => p.player_id === id || normalize(p.name) === normalize(name)
    ) ?? null
  );
};

const normalizePlayers = (
  raw: any[],
  teamId: string,
  roster: any[],
  league: "NFL" | "CFB"
): DisplayPlayer[] => {
  const teamCode = league === "NFL" ? getNFLCode(teamId) : getCFBCode(teamId);

  return raw.map((p) => {
    const id = Number(p.id);
    const local = findRosterPlayer(roster, id, p.name);

    const image = local?.avatarUrl
      ? { uri: local.avatarUrl }
      : p.image || Placeholder;

    return {
      id,
      name: p.name,
      image,
      teamCode: teamCode ?? "UNK",
      group: p.group,
      statistics: p.stats ?? [],
    };
  });
};

/* ----------------------------- */
/* Stat Config                   */
/* ----------------------------- */

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

const abbr = (k: string) => ABBR[k.toLowerCase()] ?? k.toUpperCase();

/* ----------------------------- */
/* Component                     */
/* ----------------------------- */

export default function GameLeaders({
  gameId,
  homeTeamId,
  awayTeamId,
  league,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = gameLeadersStyles(isDark, lighter);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Passing");

  const {
    leaders: rawHome,
    isLoading: loadingHome,
    isError: errorHome,
  } = useFootballGameLeaders(gameId, homeTeamId);

  const {
    leaders: rawAway,
    isLoading: loadingAway,
    isError: errorAway,
  } = useFootballGameLeaders(gameId, awayTeamId);

  /* 🔑 USE TEAM PLAYERS (FIX) */
  const { players: homeRoster } = useTeamPlayers(homeTeamId, league);
  const { players: awayRoster } = useTeamPlayers(awayTeamId, league);

  const home = useMemo(
    () => normalizePlayers(rawHome ?? [], homeTeamId, homeRoster, league),
    [rawHome, homeRoster, league]
  );

  const away = useMemo(
    () => normalizePlayers(rawAway ?? [], awayTeamId, awayRoster, league),
    [rawAway, awayRoster, league]
  );

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

  const leadersByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = {
        home: home.find((p) => p.group === cat) ?? null,
        away: away.find((p) => p.group === cat) ?? null,
      };
      return acc;
    }, {} as Record<Category, { home: DisplayPlayer | null; away: DisplayPlayer | null }>);
  }, [home, away]);

  if (loadingHome || loadingAway) return <GameLeadersSkeleton />;

  if (errorHome || errorAway)
    return <Text style={styles.error}>Failed to load leaders</Text>;

  const { home: homeP, away: awayP } = leadersByCategory[selectedCategory];

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>
      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={CATEGORIES}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          lighter={lighter} // <-- forward the prop here
          renderLabel={(tab, isSelected) => (
            <Text
              style={{
                fontFamily: Fonts.OSMEDIUM,
                fontSize: 16,
                color: isSelected ? textColor : subTextColor,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          )}
        />

        {[awayP, homeP].map((p, i) => {
          if (!p) return null;

          const logo =
            league === "NFL"
              ? getNFLTeamsLogo(p.teamCode, isDark || lighter)
              : getCFBLogo(p.teamCode, isDark || lighter);

          const stats = STAT_KEYS[selectedCategory]
            .map((k) =>
              p.statistics.find((s) => s.name.toLowerCase() === k.toLowerCase())
            )
            .filter(Boolean) as PlayerStat[];

          return (
            <View key={i} style={styles.card}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                <Image source={p.image} style={styles.avatar} />
              </View>
              <View style={styles.infoSection}>
                <Text style={styles.playerName}>{p.name}</Text>
                <View style={styles.statRow}>
                  {stats.map((s, idx) => (
                    <View key={idx} style={styles.statBlock}>
                      <Text style={styles.statLabel}>{abbr(s.name)}</Text>
                      <Text style={styles.statText}>{s.value ?? "-"}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Image source={logo} style={styles.teamLogo} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
