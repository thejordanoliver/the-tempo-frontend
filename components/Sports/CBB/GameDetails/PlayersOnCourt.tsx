import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { getNBATeam, getTeamByESPNId, getTeamLogo } from "constants/teams";
import {
  getTeamByESPNId as getCBBTeamByESPNId,
  getCBBTeamLogo,
} from "constants/teamsCBB";
import { getWNBATeamByESPNId, getWNBATeamLogo } from "constants/teamsWNBA";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
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
  homeTeamId: number;
  awayTeamId: number;
  playerStats: any[];
  teamStats?: any[];
  isLoading?: boolean;
  isError?: boolean;
  isDark: boolean;
  league: "NBA" | "WNBA" | "CBB" | "WCBB";
  gameStatusDescription: string;
};

type Player = {
  athlete: {
    id: string;
    playerId: number;
    uid: string;
    guid: string;
    displayName: string;
    teamId: number;
    shortName: string;
    headshot: { href: string; alt: string };
    jersey: string;
    position: { name: string; displayName: string; abbreviation: string };
  };
  teamType: "home" | "away";
  active: boolean;
  team: { id: number };
};

export default function PlayersOnCourt({
  homeTeamId,
  awayTeamId,
  playerStats,
  isLoading = false,
  isError = false,
  isDark,
  league,
  gameStatusDescription,
}: Props) {
  const styles = playerOnCourtStyles(isDark);
  const router = useRouter();
  const isWomen = league === "WCBB";
  const isNBA = league === "NBA";
  const isWNBA = league === "WNBA";

  const homeTeam = isWNBA
    ? getWNBATeamByESPNId(homeTeamId)
    : getTeamByESPNId(homeTeamId);
  const awayTeam = isWNBA
    ? getWNBATeamByESPNId(awayTeamId)
    : getTeamByESPNId(awayTeamId);
  const homeCBBTeam = getCBBTeamByESPNId(homeTeamId);
  const awayCBBTeam = getCBBTeamByESPNId(awayTeamId);

  const homeCode = isNBA
    ? homeTeam?.code
    : isWNBA
      ? homeTeam?.code
      : homeCBBTeam?.code;
  const awayCode = isNBA
    ? awayTeam?.code
    : isWNBA
      ? awayTeam?.code
      : awayCBBTeam?.code;
  const homeName = isNBA ? homeTeam?.fullName : homeCBBTeam?.fullName;
  const awayName = isNBA ? awayTeam?.fullName : awayCBBTeam?.fullName;

  const homeLogo = isNBA
    ? getTeamLogo(homeTeam?.id, isDark)
    : isWNBA
      ? getWNBATeamLogo(homeTeam?.id, isDark)
      : isWomen
        ? getCBBTeamLogo(homeCBBTeam?.id, isDark, true)
        : getCBBTeamLogo(homeCBBTeam?.id, isDark, false);
  const awayLogo = isNBA
    ? getTeamLogo(awayTeam?.id, isDark)
    : isWNBA
      ? getWNBATeamLogo(awayTeam?.id, isDark)
      : isWomen
        ? getCBBTeamLogo(awayCBBTeam?.id, isDark, true)
        : getCBBTeamLogo(awayCBBTeam?.id, isDark, false);

  const tabs = [
    { key: "away", label: awayName ?? "Away Team" },
    { key: "home", label: homeName ?? "Home Team" },
  ];
  const [selectedTab, setSelectedTab] = useState<"home" | "away">("away");

  // Map ESPN players
  const mapESPNPlayers = (teamId: number) => {
    const block = playerStats.find(
      (p) => Number(p.team?.id) === Number(teamId),
    );
    if (!block) return [];

    const internalTeamId = getTeamByESPNId(teamId)?.id;

    return block.athletes.map((ath: any) => {
      const a = ath.athlete || {};
      return {
        athlete: a,
        teamType: teamId === homeTeamId ? "home" : "away",
        team: { id: internalTeamId },
        active: ath.active,
      };
    });
  };

  const homePlayers = mapESPNPlayers(homeTeamId);
  const awayPlayers = mapESPNPlayers(awayTeamId);

  // Render team list
  const renderOnCourtList = (
    players: Player[],
    teamCode: string | undefined,
  ) => (
    <View>
      {players
        .filter((p) => p.active)
        .map((p, index, arr) => {
          const nbaTeam = getNBATeam(p.team.id);
          const collegeTeam = getCBBTeamByESPNId(p.athlete.teamId);
          const nbaTeamId = nbaTeam?.id;
          const collegeTeamId = isWomen ? collegeTeam?.wid : collegeTeam?.id;
          return (
            <View
              key={`${teamCode}-row-${p.athlete.id}-${index}`}
              style={[
                styles.tableRow,
                index === arr.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.playerInfo}
                onPress={() => {
                  if (p.athlete.playerId || p.athlete.id) {
                    router.push({
                      pathname: isNBA ? `/player/[id]` : `/player/cbb/[id]`,
                      params: {
                        id: isNBA ? p.athlete.playerId : p.athlete.id,
                        teamId: isNBA ? nbaTeamId : collegeTeamId, // <-- pass team ID here
                        league,
                      },
                    });
                  }
                }}
              >
                <View style={styles.playerInfoWrapper}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: p.athlete.headshot?.href ?? "" }}
                      alt={p.athlete.headshot?.alt}
                      style={styles.avatar}
                    />
                  </View>
                  <View style={styles.nameWrapper}>
                    <Text style={styles.playerName}>{p.athlete.shortName}</Text>
                    <Text style={styles.posistion}>
                      {p.athlete.position.abbreviation}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignContent: "center" }}>
                  <Text style={styles.jersey}>#{p.athlete.jersey}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );

  if (
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Final"
  ) {
    return null;
  }

  return (
    <ScrollView>
      <HeadingTwo isDark={isDark}>On The Court</HeadingTwo>
      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((t) => t.key)}
          selected={selectedTab}
          renderLabel={(tabKey, isSelected, tabStyles) => {
            const teamLogo = tabKey === "home" ? homeLogo : awayLogo;
            const teamCode = tabKey === "home" ? homeCode : awayCode;
            return (
              <View style={styles.tabLabel}>
                {teamLogo && (
                  <Image
                    source={teamLogo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {teamCode}
                </Text>
              </View>
            );
          }}
          onTabPress={(tabKey) => setSelectedTab(tabKey as "home" | "away")}
          isDark={isDark}
        />

        {!isLoading && !isError && (
          <View style={styles.container}>
            {selectedTab === "home"
              ? renderOnCourtList(homePlayers, homeCode)
              : renderOnCourtList(awayPlayers, awayCode)}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
