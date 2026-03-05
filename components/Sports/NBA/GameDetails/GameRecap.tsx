import HeadingThree from "components/Headings/HeadingThree";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameRecapSkeleton from "components/Skeletons/GameDetails/GameRecapSkeleton";
import { Colors, Fonts, globalStyles } from "constants/Styles";
import { getTeamByESPNId } from "constants/teams";
import { useGameRecap } from "hooks/useGameRecap";
import usePlayersByTeam from "hooks/usePlayersByTeam";
import React from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";

interface GameRecapProps {
  gameId: number | string;
}

export default function GameRecap({ gameId }: GameRecapProps) {
  const { recapData, loading, error } = useGameRecap(gameId);
  const isDark = useColorScheme() === "dark";
  const styles = gameRecapStyles(isDark);
  const global = globalStyles(isDark);

  // ✅ Safe derived values (hooks always run)
  const playerOfTheGame = recapData?.playerOfTheGame ?? null;

  const team = getTeamByESPNId(playerOfTheGame?.team.id ?? "");
  const teamId = team?.id ? String(team.id) : "";
  const teamCode = team?.code;

  const { players } = usePlayersByTeam(teamId);

  const playerInfo = players.find(
    (p) => String(p.espn_id) === playerOfTheGame?.playerId,
  );

  const avatarUrl = playerInfo?.avatarUrl;

  // ✅ Early returns AFTER hooks
  if (loading) return <GameRecapSkeleton />;
  if (error) return <Text style={global.errorText}>Error: {error}</Text>;
  if (!recapData) return <Text style={global.emptyText}>No recap found.</Text>;

  return (
    <View>
      <HeadingTwo>Game Recap</HeadingTwo>

      <View style={styles.wrapper}>
        {playerOfTheGame && (
          <View style={styles.playerContainer}>
            <HeadingThree>Player of the Game</HeadingThree>

            <View style={styles.playerRow}>
              {avatarUrl && (
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                </View>
              )}

              <View>
                <Text style={styles.playerName}>{playerOfTheGame.name}</Text>
                <Text style={styles.teamName}>{teamCode}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.stat}>{playerOfTheGame.points} pts</Text>
              <View style={styles.divider} />
              <Text style={styles.stat}>{playerOfTheGame.rebounds} reb</Text>
              <View style={styles.divider} />
              <Text style={styles.stat}>{playerOfTheGame.assists} ast</Text>
            </View>
          </View>
        )}

        <Text style={styles.recap}>{recapData.recap}</Text>
      </View>
    </View>
  );
}

const gameRecapStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors.midTone,
      padding: 12,
    },

    recap: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },

    playerContainer: {
      marginBottom: 12,
    },

    playerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    stat: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    divider: {
      height: 20,
      width: 1,
      marginHorizontal: 8,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    playerName: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },

    teamName: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: Colors.midTone,
    },

    avatarContainer: {
      width: 44,
      height: 44,
      paddingTop: 4,
      borderRadius: 22,
      marginRight: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    avatar: {
      width: 44,
      height: 44,
    },
  });
