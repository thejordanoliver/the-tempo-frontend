import GameLeadersSkeleton from "components/GameDetails/GameLeadersSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/GameLeadersTabBar";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo, teams } from "constants/teamsCBB";
import { useMemo, useState } from "react";
import { Dimensions, Image, Text, useColorScheme, View } from "react-native";
import { getStyles } from "styles/GameDetailStyles/GameLeaders.styles";
const SCREEN_WIDTH = Dimensions.get("window").width;

const STAT_CATEGORIES = ["points", "rebounds", "assists"] as const;
type Category = (typeof STAT_CATEGORIES)[number];
type Headshot = string | { href: string; alt?: string } | null;

type StatItem = {
  name: string;
  value: number | null;
  displayValue?: string;
};

type LeaderEntry = {
  athlete: {
    id: string | number;
    fullName: string;
    headshot?: Headshot;
    jersey?: string | number | null;
    jerseyNumber?: string | number | null;
  };
  value: number | null;

  // ESPN stats array
  statistics?: StatItem[];
};

type StatGroup = {
  name: string;
  leaders: LeaderEntry[];
};

export type LeaderGroup = {
  team: { id: string | number };
  leaders: StatGroup[];
};

type Props = {
  leaders: LeaderGroup[];
  awayTeamId: number;
  homeTeamId: number;
  lighter?: boolean;
  loading?: boolean;
};

export default function GameLeaders({
  leaders,
  awayTeamId,
  homeTeamId,
  lighter = false,
  loading = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const tabWidth = SCREEN_WIDTH / STAT_CATEGORIES.length;
  const styles = getStyles(isDark, lighter);

  // Colors
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

  // ⭐ Transform ESPN leaders → flat internal list
  const topPlayers = useMemo(() => {
    if (!leaders || leaders.length === 0) return [];

    const flat: any[] = [];

    leaders.forEach((group) => {
      const teamId = Number(group.team.id);

      (group.leaders ?? []).forEach((statGroup) => {
        (statGroup.leaders ?? []).forEach((entry) => {
          const athlete = entry.athlete;
          const stats = entry.statistics ?? [];

          const getStat = (name: string): number | string => {
            const found = stats.find((s: StatItem) => s.name === name);
            return found?.value ?? "-";
          };

          const getStatDisplay = (name: string): string => {
            const found = stats.find((s: StatItem) => s.name === name);
            return found?.displayValue ?? "-";
          };

          const points = getStat("points");
          const rebounds = getStat("rebounds") || getStat("totReb");
          const assists = getStat("assists");

          // ⭐ FG extracted properly ("6/12")
          const fieldGoals = getStatDisplay("fieldGoals");
          const freeThrows = getStatDisplay("freeThrows");
          const turnovers = getStatDisplay("turnovers");
          const minutes = getStatDisplay("minutes");
          const assistTurnoverRatio = getStatDisplay("assistTurnoverRatio");
          const defensiveRebounds = getStatDisplay("defensiveRebounds");
          const offensiveRebounds = getStatDisplay("offensiveRebounds");

          flat.push({
            category: statGroup.name.toLowerCase(),
            value: entry.value ?? points ?? null,

            team: { id: teamId },
            localPlayer: {
              id: athlete.id,
              first_name: athlete.fullName?.split(" ")[0],
              last_name: athlete.fullName?.split(" ")[1] ?? "",

              // ⭐ FIX ESPN headshot object
              headshot_url:
                typeof athlete.headshot === "string"
                  ? athlete.headshot
                  : athlete.headshot?.href ?? null,

              jersey_number: athlete.jersey ?? athlete.jerseyNumber ?? "(NA)",
            },

            points,
            totReb: rebounds,
            assists,
            fieldGoals, // ⭐ working FG now
            freeThrows, // ⭐ working FG now
            turnovers,
            minutes,
            assistTurnoverRatio,
            defensiveRebounds,
            offensiveRebounds,

            // Unused fields but included for potential UI expansion
            fgm: "-",
            fga: "-",
            tpm: "-",
            tpa: "-",
            min: "-",
            pfouls: "-",
          });
        });
      });
    });

    return flat.filter((p) => p.category === selectedCategory);
  }, [leaders, selectedCategory]);

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Leaders</HeadingTwo>

      {/* ⭐ When loading, show ONLY the skeleton */}
      {loading ? (
        <GameLeadersSkeleton />
      ) : (
        <>
          {/* ⭐ Tab Bar */}
          <View style={{ paddingHorizontal: 12 }}>
            <FixedWidthTabBar
              tabs={STAT_CATEGORIES}
              selected={selectedCategory}
              onTabPress={setSelectedCategory}
              lighter={lighter}
              containerStyle={{
                width: tabWidth * STAT_CATEGORIES.length,
                alignSelf: "center",
              }}
              renderLabel={(tab) => {
                const isSelected = tab === selectedCategory;
                return (
                  <Text
                    style={{
                      fontFamily: Fonts.OSMEDIUM,
                      fontSize: 14,
                      color: isSelected
                        ? lighter
                          ? Colors.white
                          : isDark
                          ? Colors.white
                          : Colors.black
                        : subTextColor,
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                );
              }}
            />
          </View>

          {/* ⭐ Player rows */}
          {topPlayers.map((player, idx) => {
            const p = player.localPlayer;

            const teamObj =
              teams.find((t) => String(t.espnID) === String(player.team.id)) ??
              teams.find((t) => t.espnID === homeTeamId) ??
              teams.find((t) => t.espnID === awayTeamId);

            const teamLogo = teamObj ? getTeamLogo(teamObj.id, isDark, lighter) : null;

            return (
              <View
                key={idx}
                style={[
                  styles.card,
                  { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: p?.headshot_url }}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.playerName, { color: textColor }]}>
                      {p?.first_name} {p?.last_name}
                    </Text>
                    <Text style={[styles.jersey, { color: subTextColor }]}>
                      #{p?.jersey_number ?? "(NA)"}
                    </Text>
                  </View>

                  {/* ⭐ Stats by category */}
                  <View style={styles.statRow}>
                    {selectedCategory === "points" && (
                      <>
                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            PTS
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.points}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            FG
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.fieldGoals}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            FT
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.freeThrows}
                          </Text>
                        </View>
                      </>
                    )}

                    {selectedCategory === "rebounds" && (
                      <>
                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            REB
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.totReb}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            DREB
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.defensiveRebounds}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            OREB
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.offensiveRebounds}
                          </Text>
                        </View>
                      </>
                    )}

                    {selectedCategory === "assists" && (
                      <>
                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            AST
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.assists}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            TO
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.turnovers}
                          </Text>
                        </View>

                        <View style={styles.statBlock}>
                          <Text
                            style={[styles.statLabel, { color: subTextColor }]}
                          >
                            AST/TO
                          </Text>
                          <Text style={[styles.statText, { color: textColor }]}>
                            {player.assistTurnoverRatio}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                <Image
                  source={teamLogo}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}
