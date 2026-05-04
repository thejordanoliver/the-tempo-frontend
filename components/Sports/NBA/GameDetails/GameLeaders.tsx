import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getNBATeam } from "constants/teams";
import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";
import GameLeadersSkeleton from "../../../Skeletons/GameDetails/GameLeadersSkeleton";

const STAT_CATEGORIES = ["points", "rebounds", "assists", "steals"] as const;
type Category = (typeof STAT_CATEGORIES)[number];

type Props = {
  gameLeaders: any;
  awayTeamId: number;
  homeTeamId: number;
  isDark: boolean;
  loading: boolean;
  error: any;
  gameStatusDescription: string;
};

export default function GameLeaders({
  gameLeaders,
  awayTeamId,
  homeTeamId,
  isDark,
  loading,
  error,
  gameStatusDescription,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");

  const styles = gameLeadersStyles(isDark);

  const orderedTeams = useMemo(() => {
    if (!gameLeaders) return [];

    const away = gameLeaders.find((t: any) => t.team.id === awayTeamId);
    const home = gameLeaders.find((t: any) => t.team.id === homeTeamId);

    return [away, home].filter(Boolean);
  }, [gameLeaders, awayTeamId, homeTeamId]);

  const topPlayers = useMemo(() => {
    return orderedTeams
      .map((teamBlock: any) => {
        const leader = teamBlock?.leaders?.[selectedCategory];

        if (!leader?.player || !leader?.stats) return null;

        return {
          team: teamBlock.team,
          teamType: teamBlock.teamType,
          player: leader.player,
          stats: leader.stats,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [orderedTeams, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.container}>
        <GameLeadersSkeleton />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <GameLeadersSkeleton />
      </View>
    );
  }

  if (!topPlayers.length) return null;
  if (gameStatusDescription === "Scheduled") return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Game Leaders</HeadingTwo>

      <View style={styles.wrapper}>
        <MainScrollTabBar
          tabs={STAT_CATEGORIES}
          selected={selectedCategory}
          onTabPress={setSelectedCategory}
          isDark={isDark}
        />

        {topPlayers.map((item: any, idx: number) => {
          const p = item.player;
          const team = getNBATeam(item.team.id);
          const stats = item.stats;

          return (
            <View key={`${item.team.id}-${idx}`} style={styles.card}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: p?.headshot_url }}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.playerName}>
                    {p?.first_name} {p?.last_name}
                  </Text>
                  <Text style={styles.jersey}>#{p?.jersey_number ?? "NA"}</Text>
                </View>

                <View style={styles.statRow}>
                  {selectedCategory === "points" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>PTS</Text>
                        <Text style={styles.statText}>
                          {stats?.points ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>FG</Text>
                        <Text style={styles.statText}>
                          {stats?.fgm ?? "-"}/{stats?.fga ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>3PT</Text>
                        <Text style={styles.statText}>
                          {stats?.tpm ?? "-"}/{stats?.tpa ?? "-"}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === "rebounds" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>REB</Text>
                        <Text style={styles.statText}>
                          {stats?.totReb ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>OREB</Text>
                        <Text style={styles.statText}>
                          {stats?.offReb ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>DREB</Text>
                        <Text style={styles.statText}>
                          {stats?.defReb ?? "-"}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === "assists" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>AST</Text>
                        <Text style={styles.statText}>
                          {stats?.assists ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>TO</Text>
                        <Text style={styles.statText}>
                          {stats?.turnovers ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>MIN</Text>
                        <Text style={styles.statText}>{stats?.min ?? "-"}</Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === "steals" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>STL</Text>
                        <Text style={styles.statText}>
                          {stats?.steals ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>FOUL</Text>
                        <Text style={styles.statText}>
                          {stats?.fouls ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>MIN</Text>
                        <Text style={styles.statText}>{stats?.min ?? "-"}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              <Image
                source={isDark ? team?.logoLight || team?.logo : team?.logo}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
