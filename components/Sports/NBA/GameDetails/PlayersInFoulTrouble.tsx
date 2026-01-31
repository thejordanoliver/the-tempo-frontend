import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/Styles";
import { getTeamById } from "constants/teams";
import useDbPlayersByTeam from "hooks/usePlayersByTeam";
import {
  PlayerStat,
  usePlayersInFoulTrouble,
} from "hooks/usePlayersInFoulTrouble";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { CBBTeam, Team } from "types/types";

type Props = {
  gameId: number | string;
  home?: Team | CBBTeam;
  away?: Team | CBBTeam;
  lighter?: boolean;
};

export default function PlayersInFoulTrouble({
  gameId,
  home,
  away,
  lighter = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = foulTroubleStyles(isDark, lighter);

  const { players, loading, error } = usePlayersInFoulTrouble({ gameId });

  const homeId = home?.id;
  const awayId = away?.id;

  const homeTeam = getTeamById(homeId);
  const awayTeam = getTeamById(awayId);

  const homePlayers = useDbPlayersByTeam(homeId ? String(homeId) : "");
  const awayPlayers = useDbPlayersByTeam(awayId ? String(awayId) : "");

  const dbPlayersByTeam = {
    [String(homeId)]: homePlayers.players,
    [String(awayId)]: awayPlayers.players,
  };

  const tabs = [
    away && {
      id: String(awayTeam?.id),
      label: awayTeam?.code,
      logo: awayTeam?.logo,
      logoLight: awayTeam?.logoLight,
    },
    home && {
      id: String(homeTeam?.id),
      label: homeTeam?.code,
      logo: homeTeam?.logo,
      logoLight: homeTeam?.logoLight,
    },
  ].filter(Boolean) as {
    id: string;
    label: string;
    logo?: any;
    logoLight?: any;
  }[];

  const [selectedTeamId, setSelectedTeamId] = useState(
    awayId ? String(awayId) : tabs[0]?.id || ""
  );

  const renderRow = ({ item, index }: { item: PlayerStat; index: number }) => {
    const dbPlayer = dbPlayersByTeam[item.team.id]?.find(
      (p) => p.player_id === item.player.id
    );

    const headshotUrl = dbPlayer?.avatarUrl;
    const name = `${dbPlayer?.first_name} ${dbPlayer?.last_name}`;

    const isLast = index === players.length - 1;
    const isFouledOut = item.pFouls === 6;

    function fouledOut(isFouledOut: boolean, fouls: number) {
      if (isFouledOut) {
        return "Fouled Out";
      } else {
        return fouls;
      }
    }

    return (
      <View style={[styles.playerRow, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.left}>
          <View style={styles.avatarWrapper}>
            {headshotUrl && (
              <Image source={{ uri: headshotUrl }} style={styles.avatar} />
            )}
          </View>
          <Text style={styles.name}>{name}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.value}>
            {fouledOut(isFouledOut, item.pFouls)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.constainer}>
      <HeadingTwo>In Foul Trouble</HeadingTwo>
      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs.map((t) => t.id)} // 👈 IDs, not names
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
          lighter={lighter}
          renderLabel={(tabId, isSelected) => {
            const tab = tabs.find((t) => t.id === tabId);
            if (!tab) return null;

            return (
              <View style={styles.tabLabel}>
                {tab.logo && (
                  <Image
                    source={
                      lighter
                        ? tab.logoLight || tab.logo
                        : isDark
                        ? tab.logoLight || tab.logo
                        : tab.logo
                    }
                    style={[styles.logo, { opacity: isSelected ? 1 : 0.5 }]}
                    resizeMode="contain"
                  />
                )}

                <Text
                  style={getLabelStyle(isDark, isSelected, lighter, {
                    opacity: isSelected ? 1 : 0.5,
                  })}
                >
                  {tab.label}
                </Text>
              </View>
            );
          }}
        />
        <FlatList
          data={
            selectedTeamId
              ? players
                  .filter((p) => String(p.team.id) === selectedTeamId)
                  .sort((a, b) => b.pFouls - a.pFouls) // ✅ sort by most fouls first
              : [...players].sort((a, b) => b.pFouls - a.pFouls)
          }
          keyExtractor={(item) => item.player.id.toString()}
          renderItem={renderRow}
          scrollEnabled={false}
          ListEmptyComponent={
            <View>
              <Text style={styles.emptyText}>No Players</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const foulTroubleStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    constainer: {},
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 10,
    },
    playerRow: {
      marginHorizontal: 12,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.lightGray,
    },
    left: { flexDirection: "row", alignItems: "center", gap: 8 },
    right: {},
    avatar: {
      width: 50,
      height: 50,
    },
    avatarWrapper: {
      width: 50,
      height: 50,
      borderRadius: 100,
      paddingTop: 8,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },
    name: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },
    value: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: lighter
        ? Colors.dark.lightRed
        : isDark
        ? Colors.dark.lightRed
        : Colors.light.red,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
    },
    emptyText: {
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
      marginTop: 20,
      fontFamily: Fonts.OSREGULAR,
      padding: 12,
    },
  });
