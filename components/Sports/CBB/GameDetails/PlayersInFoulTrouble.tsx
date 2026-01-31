import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/Styles";
import { getTeamInfo } from "constants/teamsCBB";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import {
  PlayerStat,
  usePlayersInFoulTrouble,
} from "hooks/usePlayersInFoulTrouble";
import React, { useMemo, useState } from "react";
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
  const isDark = useColorScheme() === "dark";
  const styles = foulTroubleStyles(isDark, lighter);

  const { players } = usePlayersInFoulTrouble({ gameId });

  const homeId = home?.id;
  const awayId = away?.id;

  const homeTeam = homeId ? getTeamInfo(homeId) : undefined;
  const awayTeam = awayId ? getTeamInfo(awayId) : undefined;

  const homePlayers = usePlayersByTeam(homeId ? String(homeId) : "");
  const awayPlayers = usePlayersByTeam(awayId ? String(awayId) : "");

  /**
   * ✅ Map DB players by TEAM ID (string-safe)
   */
  const dbPlayersByTeam: Record<string, any[]> = {
    ...(homeId && { [String(homeId)]: homePlayers.players }),
    ...(awayId && { [String(awayId)]: awayPlayers.players }),
  };

  /**
   * ✅ Safe tab construction (no undefined IDs)
   */
  const tabs = useMemo(
    () =>
      [
        awayTeam?.id && {
          id: String(awayTeam.id),
          label: awayTeam.code,
          logo: awayTeam.logo,
          logoLight: awayTeam.logoLight,
        },
        homeTeam?.id && {
          id: String(homeTeam.id),
          label: homeTeam.code,
          logo: homeTeam.logo,
          logoLight: homeTeam.logoLight,
        },
      ].filter(Boolean) as {
        id: string;
        label: string;
        logo?: any;
        logoLight?: any;
      }[],
    [homeTeam, awayTeam]
  );

  const tabIds = tabs.map((t) => t.id);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    tabIds[0] ?? ""
  );

  const renderRow = ({ item, index }: { item: PlayerStat; index: number }) => {
    const teamKey = String(item.team.id);

    const dbPlayer = dbPlayersByTeam[teamKey]?.find(
      (p) => p.id === item.player.id
    );

    const headshotUrl = dbPlayer?.imageUrl;
    const name = dbPlayer
      ? `${dbPlayer.firstname} ${dbPlayer.lastname}`
      : item.player.firstname;

    const isLast = index === players.length - 1;
    const isFouledOut = item.pFouls === 6;

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

        <View style={styles.left}>
          <Text style={styles.value}>
            {isFouledOut ? "Fouled Out" : item.pFouls}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.constainer}>
      <HeadingTwo>In Foul Trouble</HeadingTwo>

      <View style={styles.wrapper}>
        {tabIds.length > 0 && (
          <FixedWidthTabBar
            tabs={tabIds}
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
                      style={[
                        styles.logo,
                        { opacity: isSelected ? 1 : 0.5 },
                      ]}
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
        )}

        <FlatList
          data={players
            .filter(
              (p) =>
                !selectedTeamId ||
                String(p.team.id) === selectedTeamId
            )
            .sort((a, b) => b.pFouls - a.pFouls)}
          keyExtractor={(item) => item.player.id.toString()}
          renderItem={renderRow}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Players</Text>
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
    avatar: { width: 50, height: 50 },
    avatarWrapper: {
      width: 50,
      height: 50,
      borderRadius: 100,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    name: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
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
    logo: { width: 28, height: 28 },
    emptyText: {
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
      marginTop: 20,
      fontFamily: Fonts.OSREGULAR,
      padding: 12,
    },
  });
