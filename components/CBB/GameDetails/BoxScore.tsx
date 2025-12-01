import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCBB";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";

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

  /** NOW PASSED FROM PARENT — NO HOOK */
  playerStats: any[];
  teamStats?: any[];

  isLoading?: boolean;
  isError?: boolean;

  lighter?: boolean;
};

type CBBTeam = (typeof teams)[number];

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
}: Props) {
  const isDark = useColorScheme() === "dark";

  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {}
  );

  const heightAnimMap = useRef<Record<string, Animated.Value>>({});
  const teamsById = Object.fromEntries(teams.map((t) => [Number(t.id), t]));
  const teamsByEspnId = Object.fromEntries(
    teams.map((t) => [Number(t.espnID), t])
  );

  const homeTeam = teamsByEspnId[homeTeamId];
  const awayTeam = teamsByEspnId[awayTeamId];

  const homeCode = homeTeam?.code ?? "home";
  const awayCode = awayTeam?.code ?? "away";

  // ----- MAP ESPN PLAYER STATS INTO UI SHAPE -----
  const mapESPNPlayers = (teamId: number) => {
    const block = playerStats.find(
      (p) => Number(p.team?.id) === Number(teamId)
    );
    if (!block) return [];

    const internalTeamId = teamsByEspnId[teamId]?.id;

    return block.athletes.map((ath: any) => {
      const a = ath.athlete || {};

      return {
        localPlayer: {
          first_name: a.displayName?.split(" ")[0] ?? "",
          last_name: a.displayName?.split(" ")[1] ?? "",
          player_id: a.id,
        },
        teamType: teamId === homeTeamId ? "home" : "away",
        min: ath.statValues?.[0] ?? "0",
        points: ath.statValues?.[1] ?? 0,
        fgm: Number(ath.statValues?.[2]?.split("-")[0] ?? 0),
        fga: Number(ath.statValues?.[2]?.split("-")[1] ?? 0),

        tpm: Number(ath.statValues?.[3]?.split("-")[0] ?? 0),
        tpa: Number(ath.statValues?.[3]?.split("-")[1] ?? 0),

        ftm: Number(ath.statValues?.[4]?.split("-")[0] ?? 0),
        fta: Number(ath.statValues?.[4]?.split("-")[1] ?? 0),

        offReb: Number(ath.statValues?.[10] ?? 0),
        defReb: Number(ath.statValues?.[11] ?? 0),
        totReb: Number(ath.statValues?.[5] ?? 0),

        assists: Number(ath.statValues?.[6] ?? 0),
        steals: Number(ath.statValues?.[8] ?? 0),
        blocks: Number(ath.statValues?.[9] ?? 0),
        turnovers: Number(ath.statValues?.[7] ?? 0),
        pFouls: Number(ath.statValues?.[12] ?? 0),
        plusMinus: 0,

        // FIX: use internal team id
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

  const getTeamLogo = (team: CBBTeam | null | undefined) => {
    if (!team) return "";
    return isDark ? team.logoLight ?? team.logo : team.logo;
  };

  const renderTeamBox = (
    players: MappedPlayer[],
    teamName: string,
    teamLogo: any,
    teamColor: string,
    secondaryColor: string,
    teamCode: string,
    isExpanded: boolean,
    heightAnim: Animated.Value
  ) => {
    const borderColor = isDark ? secondaryColor ?? teamColor : teamColor;

    return (
      <View style={[styles.teamBox, { borderColor }]}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text
            style={[
              styles.teamLabel,
              { color: isDark ? Colors.white : teamColor },
            ]}
          >
            {teamName}
          </Text>

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
          <View style={{ width: NAME_COLUMN_WIDTH }}>
            <View
              style={[
                styles.tableHeader,
                { borderColor: isDark ? Colors.darkGray : Colors.lightGray },
              ]}
            >
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
                  style={[
                    styles.tableRow,
                    {
                      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
                    },
                  ]}
                >
                  <TouchableOpacity
                    key={`${teamCode}-${index}`}
                    onPress={() =>
                      router.push(
                        `/player/cbb/${p.localPlayer.player_id}?teamId=${p.team.id}`
                      )
                    }
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.cellName,
                        { color: isDark ? Colors.white : Colors.black },
                      ]}
                    >
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
                    borderColor: isDark ? Colors.darkGray : Colors.lightGray,
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
                    style={[
                      styles.tableRow,
                      {
                        borderColor: isDark
                          ? Colors.darkGray
                          : Colors.lightGray,
                      },
                    ]}
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
                        <Text
                          style={[
                            styles.cell,
                            {
                              color: isDark
                                ? Colors.lightGray
                                : Colors.darkGray,
                              fontFamily: Fonts.OSREGULAR,
                            },
                          ]}
                        >
                          {val}
                        </Text>
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
            onPress={() => toggleExpand(teamCode)}
            style={{ padding: 10, alignItems: "center" }}
          >
            <Text
              style={{
                color: isDark ? Colors.lightGray : Colors.darkGray,
                fontFamily: Fonts.OSMEDIUM,
                fontSize: 14,
              }}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <HeadingTwo>Box Score</HeadingTwo>

      {isLoading && (
        <Text
          style={[
            styles.loading,
            { color: isDark ? Colors.white : Colors.black },
          ]}
        >
          Loading box score...
        </Text>
      )}

      {isError && (
        <Text
          style={[
            styles.error,
            { color: isDark ? Colors.dark.lightRed : Colors.light.red },
          ]}
        >
          Failed to load box score.
        </Text>
      )}

      {!isLoading && !isError && (
        <>
          {renderTeamBox(
            awayPlayers,
            awayTeam?.fullName ?? "Away Team",
            getTeamLogo(awayTeam),
            awayTeam?.color ?? Colors.black,
            awayTeam?.secondaryColor ?? "",
            awayCode,
            expandedTeams[awayCode] ?? false,
            heightAnimMap.current[awayCode]
          )}

          {renderTeamBox(
            homePlayers,
            homeTeam?.fullName ?? "Home Team",
            getTeamLogo(homeTeam),
            homeTeam?.color ?? Colors.black,
            homeTeam?.secondaryColor ?? "",
            homeCode,
            expandedTeams[homeCode] ?? false,
            heightAnimMap.current[homeCode]
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  loading: {
    textAlign: "center",
    padding: 20,
    fontFamily: Fonts.OSREGULAR,
    fontSize: 16,
  },
  error: {
    textAlign: "center",
    padding: 20,
    fontFamily: Fonts.OSREGULAR,
    fontSize: 16,
  },
  teamBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 24,
    overflow: "hidden",
  },
  teamLabel: {
    fontSize: 20,
    fontFamily: Fonts.OSBOLD,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 8,
    height: 40,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 6,
    height: PLAYER_ROW_HEIGHT,
  },
  cellName: {
    width: NAME_COLUMN_WIDTH,
    fontFamily: Fonts.OSBOLD,
    fontSize: 14,
    paddingHorizontal: 8,
    textAlignVertical: "center",
  },
  cell: {
    width: COLUMN_WIDTH,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  cellContainer: { justifyContent: "center", alignItems: "center" },
  teamLogo: { width: 28, height: 28, resizeMode: "contain" },
});
