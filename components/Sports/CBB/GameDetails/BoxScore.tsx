import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { getTeamByESPNId as getSLTeamByESPNId } from "constants/teams";
import { getTeamByESPNId } from "constants/teamsCBB";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import BoxScoreSkeleton from "../../../Skeletons/GameDetails/BoxScoreSkeleton";

import {
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import { boxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const PLAYER_ROW_HEIGHT = 36;
const COLLAPSED_ROWS = 5;
const COLLAPSED_HEIGHT = PLAYER_ROW_HEIGHT * COLLAPSED_ROWS;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  homeTeamId: number;
  awayTeamId: number;
  playerStats: any[];
  teamStats?: any[];
  isLoading?: boolean;
  isError?: boolean;
  lighter?: boolean;
  league: "CBB" | "WCBB" | "SL";
};

type MappedPlayer = {
  localPlayer: { first_name: string; last_name: string; player_id: string };
  teamType: "home" | "away";
  min: string | number;
  points: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  offReb: number;
  defReb: number;
  totReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  pFouls: number;
  plusMinus: number;
  team: { id: number };
};

export default function BoxScore({
  homeTeamId,
  awayTeamId,
  playerStats,
  isLoading = false,
  isError = false,
  lighter = false,
  league,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = boxScoreStyles(isDark, lighter);
  const global = globalStyles(isDark, lighter);
  const heightAnimMap = useRef<Record<string, Animated.Value>>({});
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const homeTeam =
    league === "SL"
      ? getSLTeamByESPNId(homeTeamId)
      : getTeamByESPNId(homeTeamId);
  const awayTeam =
    league === "SL"
      ? getSLTeamByESPNId(awayTeamId)
      : getTeamByESPNId(awayTeamId);
  const isWomen = league === "WCBB";
  const homeCode = homeTeam?.code ?? "home";
  const awayCode = awayTeam?.code ?? "away";
  // Determine home logo
  const homeLogo = (() => {
    if (league === "CBB" || league === "WCBB") {
      // college teams may have wLogo
      const cTeam = homeTeam as {
        wLogo?: string;
        logo?: string;
        logoLight?: string;
      };
      return isDark
        ? cTeam.wLogo || cTeam.logoLight || cTeam.logo
        : cTeam.wLogo || cTeam.logo;
    } else {
      // SL / NBA teams
      const nTeam = homeTeam as { logo?: string; logoLight?: string };
      return isDark ? nTeam.logoLight || nTeam.logo : nTeam.logo;
    }
  })();

  // Determine away logo
  const awayLogo = (() => {
    if (league === "CBB" || league === "WCBB") {
      const cTeam = awayTeam as {
        wLogo?: string;
        logo?: string;
        logoLight?: string;
      };
      return isDark
        ? cTeam.wLogo || cTeam.logoLight || cTeam.logo
        : cTeam.wLogo || cTeam.logo;
    } else {
      const nTeam = awayTeam as { logo?: string; logoLight?: string };
      return isDark ? nTeam.logoLight || nTeam.logo : nTeam.logo;
    }
  })();

  // ----- MAP ESPN PLAYER STATS INTO UI SHAPE -----
  const mapESPNPlayers = (teamId: number) => {
    const block = playerStats.find(
      (p) => Number(p.team?.id) === Number(teamId),
    );
    if (!block) return [];

    const internalTeamId = getTeamByESPNId(teamId)?.id;

    return block.athletes.map((ath: any) => {
      const a = ath.athlete || {};
      const stats = ath.stats ?? ath.statValues ?? [];
      const fg = stats[2]?.split("-") ?? ["0", "0"];
      const tp = stats[3]?.split("-") ?? ["0", "0"];
      const ft = stats[4]?.split("-") ?? ["0", "0"];

      return {
        localPlayer: {
          first_name: a.displayName?.split(" ")[0] ?? "",
          last_name: a.displayName?.split(" ").slice(1).join(" ") ?? "",
          short_name: a.shortName,
          player_id: a.id,
        },
        teamType: teamId === homeTeamId ? "home" : "away",

        min: stats[0] ?? "0",
        points: Number(stats[1] ?? 0),

        fgm: Number(fg[0]),
        fga: Number(fg[1]),

        tpm: Number(tp[0]),
        tpa: Number(tp[1]),

        ftm: Number(ft[0]),
        fta: Number(ft[1]),

        totReb: Number(stats[5] ?? 0),
        assists: Number(stats[6] ?? 0),
        turnovers: Number(stats[7] ?? 0),
        steals: Number(stats[8] ?? 0),
        blocks: Number(stats[9] ?? 0),

        offReb: Number(stats[10] ?? 0),
        defReb: Number(stats[11] ?? 0),

        pFouls: Number(stats[12] ?? 0),
        plusMinus: 0,

        team: { id: internalTeamId },
      };
    });
  };

  const homePlayers = mapESPNPlayers(homeTeamId);
  const awayPlayers = mapESPNPlayers(awayTeamId);

  // Init animations
  [homeCode, awayCode].forEach((c) => {
    if (!heightAnimMap.current[c]) {
      heightAnimMap.current[c] = new Animated.Value(COLLAPSED_HEIGHT);
    }
  });

  useEffect(() => {
    [homeCode, awayCode].forEach((code) => {
      const isExpanded = expandedTeams[code] ?? false;
      const players = code === homeCode ? homePlayers : awayPlayers;

      Animated.timing(heightAnimMap.current[code], {
        toValue: isExpanded
          ? players.length * PLAYER_ROW_HEIGHT
          : COLLAPSED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedTeams, homePlayers.length, awayPlayers.length]);

  const formatMin = (min: string | number) => {
    if (!min) return "0";
    if (typeof min === "string" && min.includes(":")) {
      const [m, s] = min.split(":").map(Number);
      return (m + s / 60).toFixed(1);
    }
    return min;
  };

  const percent = (m: number, a: number) =>
    a ? ((m / a) * 100).toFixed(1) + "%" : "0.0%";

  const STAT_LABELS = [
    "MIN",
    "PTS",
    "FGM",
    "FGA",
    "FG%",
    "3PM",
    "3PA",
    "3P%",
    "FTM",
    "FTA",
    "FT%",
    "OREB",
    "DREB",
    "REB",
    "AST",
    "STL",
    "BLK",
    "TO",
    "PF",
    "+/-",
  ];

  const toggleExpand = (code: string) =>
    setExpandedTeams((p) => ({ ...p, [code]: !p[code] }));

  const renderTeamBox = (
    players: MappedPlayer[],
    teamName: string,
    teamLogo: any,
    teamCode: string,
    isExpanded: boolean,
    heightAnim: Animated.Value,
  ) => {
    return (
      <View style={styles.teamBox}>
        {/* HEADER */}
        <View style={styles.teamHeader}>
          <Text style={styles.teamLabel}>{teamName}</Text>

          {!!teamLogo && (
            <Image
              source={teamLogo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* TABLE */}
        <View style={{ flexDirection: "row", width: "100%" }}>
          {/* PLAYER NAMES */}
          <View
            style={{
              width: NAME_COLUMN_WIDTH,
            }}
          >
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.cellName,
                  { color: isDark ? Colors.white : Colors.black },
                ]}
              >
                Player
              </Text>
            </View>

            <Animated.View
              style={{ maxHeight: heightAnim, overflow: "hidden" }}
            >
              {players.map((p, index) => (
                <View
                  key={`${teamCode}-row-${p.localPlayer.player_id}-${index}`}
                  style={styles.tableRow}
                >
                  <TouchableOpacity
                    key={`${teamCode}-${index}`}
                    onPress={() =>
                      router.push(
                        `/player/cbb/${p.localPlayer.player_id}?teamId=${p.team.id}`,
                      )
                    }
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.cellName]}>
                      {p.localPlayer.first_name} {p.localPlayer.last_name}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* STATS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* HEADER */}
              <View
                style={[
                  styles.tableHeader,
                  {
                    minWidth: STAT_LABELS.length * COLUMN_WIDTH,
                  },
                ]}
              >
                {STAT_LABELS.map((label) => (
                  <Text
                    key={label}
                    style={[
                      styles.cell,
                      {
                        color: isDark ? Colors.white : Colors.black,
                        fontFamily: Fonts.OSMEDIUM,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              {/* ROWS */}
              <Animated.View
                style={{ maxHeight: heightAnim, overflow: "hidden" }}
              >
                {players.map((p, index) => (
                  <View
                    key={`${teamCode}-row-${p.localPlayer.player_id}-${index}`}
                    style={styles.tableRow}
                  >
                    {[
                      formatMin(p.min),
                      p.points,
                      p.fgm,
                      p.fga,
                      percent(p.fgm, p.fga),
                      p.tpm,
                      p.tpa,
                      percent(p.tpm, p.tpa),
                      p.ftm,
                      p.fta,
                      percent(p.ftm, p.fta),
                      p.offReb,
                      p.defReb,
                      p.totReb,
                      p.assists,
                      p.steals,
                      p.blocks,
                      p.turnovers,
                      p.pFouls,
                      p.plusMinus,
                    ].map((val, i) => (
                      <View
                        key={`${teamCode}-${index}-${i}`}
                        style={styles.cellContainer}
                      >
                        <Text style={styles.cell}>{val}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </Animated.View>
            </View>
          </ScrollView>
        </View>

        {/* EXPAND / COLLAPSE */}
        {players.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => toggleExpand(teamCode)}
            style={{ padding: 10, alignItems: "center" }}
          >
            <Text style={styles.showMoreLess}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ⏳ Loading state — render skeleton only
  if (isLoading) {
    return (
      <ScrollView>
        <HeadingTwo lighter={lighter}>Box Score</HeadingTwo>
        <BoxScoreSkeleton lighter={lighter} />
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <ScrollView>
        <HeadingTwo lighter={lighter}>Box Score</HeadingTwo>
        <Text style={global.errorText}>Failed to load box score.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <HeadingTwo>Box Score</HeadingTwo>
      <View style={{ marginBottom: 24 }}>
        {renderTeamBox(
          awayPlayers,
          awayTeam?.fullName ?? "Away Team",
          awayLogo,
          awayCode,
          expandedTeams[awayCode] ?? false,
          heightAnimMap.current[awayCode],
        )}
      </View>

      {renderTeamBox(
        homePlayers,
        homeTeam?.fullName ?? "Home Team",
        homeLogo,
        homeCode,
        expandedTeams[homeCode] ?? false,
        heightAnimMap.current[homeCode],
      )}
    </ScrollView>
  );
}
