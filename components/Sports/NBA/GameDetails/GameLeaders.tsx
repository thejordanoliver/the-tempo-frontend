import HeadingTwo from "components/Headings/HeadingTwo";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { useGameLeaders } from "hooks/NBAHooks/useGameLeaders";
import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";
import { gameLeadersStyles } from "styles/GameDetailStyles/GameLeadersStyles";
import GameLeadersSkeleton from "../../../Skeletons/GameDetails/GameLeadersSkeleton";

const STAT_CATEGORIES = ["points", "rebounds", "assists", "steals"] as const;
type Category = (typeof STAT_CATEGORIES)[number];

type Props = {
  gameId: string;
  awayTeamId: number;
  homeTeamId: number;
  isDark: boolean; // new prop to force lighter colors
};

export default function GameLeaders({
  gameId,
  awayTeamId,
  homeTeamId,
  isDark,
}: Props) {
  const { data, isLoading, isError } = useGameLeaders(
    gameId,
    awayTeamId,
    homeTeamId,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>("points");
  const styles = gameLeadersStyles(isDark);

  // Memoized top players
  const CATEGORY_FIELD_MAP = {
    points: "points",
    rebounds: "totReb",
    assists: "assists",
    steals: "steals",
  } as const;

  const topPlayers = useMemo(() => {
    if (!data) return [];

    const getTopPlayerPerTeam = (category: Category) => {
      const field = CATEGORY_FIELD_MAP[category];

      const validPlayers = data.filter(
        (p) => p.player && typeof p[field] === "number",
      );

      const teams = [...new Set(validPlayers.map((p) => p.team.id))];

      return teams.map((teamId) => {
        const playersFromTeam = validPlayers.filter(
          (p) => p.team.id === teamId,
        );

        return playersFromTeam.sort(
          (a, b) => (b[field] ?? 0) - (a[field] ?? 0),
        )[0];
      });
    };

    const players = getTopPlayerPerTeam(selectedCategory);

    return players.sort((a, b) => {
      if (a.team.id === awayTeamId) return -1;
      if (b.team.id === awayTeamId) return 1;
      if (a.team.id === homeTeamId) return -1;
      if (b.team.id === homeTeamId) return 1;
      return 0;
    });
  }, [data, selectedCategory, awayTeamId, homeTeamId]);

  // Add this check:
  if (!topPlayers.length) return null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GameLeadersSkeleton />
      </View>
    );
  }
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

        {topPlayers.map((player, idx) => {
          const p = player.localPlayer;
          const team = getNBATeam(player.team.id);
          const logo = getTeamLogo(team?.id, isDark);
          return (
            <View key={idx} style={styles.card}>
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
                  <Text style={styles.jersey}>
                    #{p?.jersey_number ?? "(NA)"}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  {selectedCategory === "points" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>PTS</Text>
                        <Text style={styles.statText}>
                          {player.points ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>FG</Text>
                        <Text style={styles.statText}>
                          {player.fgm ?? "-"}/{player.fga ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>3PT</Text>
                        <Text style={styles.statText}>
                          {player.tpm ?? "-"}/{player.tpa ?? "-"}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === "rebounds" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>REB</Text>
                        <Text style={styles.statText}>
                          {player.totReb ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>DREB</Text>
                        <Text style={styles.statText}>
                          {player.defReb ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>OREB</Text>
                        <Text style={styles.statText}>
                          {player.offReb ?? "-"}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === "assists" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>AST</Text>
                        <Text style={styles.statText}>
                          {player.assists ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>TO</Text>
                        <Text style={styles.statText}>
                          {player.turnovers ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>MIN</Text>
                        <Text style={styles.statText}>{player.min ?? "-"}</Text>
                      </View>
                    </>
                  )}
                  {selectedCategory === "steals" && (
                    <>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>STLS</Text>
                        <Text style={styles.statText}>
                          {player.steals ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>FOULS</Text>
                        <Text style={styles.statText}>
                          {player.pFouls ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>MIN</Text>
                        <Text style={styles.statText}>{player.min ?? "-"}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              <Image
                source={isDark ? team?.logoLight || team?.logo : logo}
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
