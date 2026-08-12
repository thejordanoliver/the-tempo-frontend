import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import {
  Athlete,
  PlayerStats,
  PlayerStatsGroup,
} from "@/hooks/BasketballHooks/useBasketballGameDetails";
import Placeholder from "assets/Placeholders/playerPlaceholder.png";
import HeadingTwo from "components/Headings/HeadingTwo";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { playerOnCourtStyles } from "styles/GameDetailStyles/PlayerOnCourtStyles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  homeId: number;
  awayId: number;
  awayLogo: ImageSourcePropType;
  homeLogo: ImageSourcePropType;
  awayCode: string;
  homeCode: string;
  playerStats: PlayerStats;
  teamStats?: unknown[];
  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: string;
  state: string | null;
};

function findTeamGroup(
  playerStats: PlayerStats,
  teamId: number,
): PlayerStatsGroup | undefined {
  return playerStats.find(
    (group) =>
      Number(group.team.id) === Number(teamId) ||
      Number(group.team.espnId) === Number(teamId),
  );
}

export default function PlayersOnCourt({
  homeId,
  awayId,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  playerStats,
  isLoading = false,
  isError = false,
  isDark,
  league,
  state,
}: Props) {
  const styles = playerOnCourtStyles(isDark);
  const router = useRouter();
  const leagueId = league.toUpperCase();

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const awayGroup = useMemo(
    () => findTeamGroup(playerStats, awayId) ?? playerStats[0],
    [awayId, playerStats],
  );

  const homeGroup = useMemo(
    () => findTeamGroup(playerStats, homeId) ?? playerStats[1],
    [homeId, playerStats],
  );

  const awayPlayers = awayGroup?.athletes ?? [];
  const homePlayers = homeGroup?.athletes ?? [];

  const renderOnCourtList = (
    players: Athlete[],
    team: PlayerStatsGroup["team"] | undefined,
    teamCode: string,
  ) => {
    const activePlayers = players.filter(
      (player) => player.active && !player.didNotPlay,
    );

    return (
      <View>
        {activePlayers.map((player, index) => {
          const playerId = player.id;
          const teamId = team?.id;

          return (
            <View
              key={`${teamCode}-row-${player.id}`}
              style={[
                styles.tableRow,
                index === activePlayers.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.playerInfo}
                onPress={() => {
                  if (!playerId) {
                    return;
                  }

                  router.push({
                    pathname: "/player/basketball/[id]",
                    params: {
                      id: String(playerId),
                      teamId: teamId != null ? String(teamId) : undefined,
                      leagueId,
                    },
                  });
                }}
              >
                <View style={styles.playerInfoWrapper}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={
                        player.headshot ? { uri: player.headshot } : Placeholder
                      }
                      accessibilityLabel={player.shortName ?? "Player headshot"}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={styles.nameWrapper}>
                    <Text style={styles.playerName}>
                      {player.shortName ?? "Unknown Player"}
                    </Text>

                    {player.position && (
                      <Text style={styles.posistion}>{player.position}</Text>
                    )}
                  </View>
                </View>

                {player.jersey && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.jersey}>#{player.jersey}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  if (state !== "in") {
    return null;
  }

  return (
    <ScrollView>
      <HeadingTwo isDark={isDark}>On The Court</HeadingTwo>

      <View style={styles.wrapper}>
        <HomeAwayTabBar
          awayTeam={{
            id: awayId,
            name: awayCode || "AWAY",
            logo: awayLogo,
          }}
          homeTeam={{
            id: homeId,
            name: homeCode || "HOME",
            logo: homeLogo,
          }}
          selected={selectedTab}
          onTabPress={setSelectedTab}
          isDark={isDark}
          showAllTab={false}
        />

        {!isLoading && !isError && (
          <View style={styles.container}>
            {selectedTab === "home"
              ? renderOnCourtList(homePlayers, homeGroup?.team, homeCode)
              : renderOnCourtList(awayPlayers, awayGroup?.team, awayCode)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
