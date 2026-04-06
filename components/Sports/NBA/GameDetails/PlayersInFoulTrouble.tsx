import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/styles";
import React, { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

type Player = {
  id: string;
  teamId: string;
  name: string;
  jersey: string;
  fouls: number;
  avatarUrl?: string;
};

type Props = {
  homeId: string;
  awayId: string;
  homeCode: string | undefined;
  awayCode: string | undefined;
  homeLogo?: any;
  awayLogo?: any;
  homePlayers: Player[];
  awayPlayers: Player[];
  isDark: boolean;
  league: "NBA" | "WNBA" | "CBB" | "WCBB";
};
export default function PlayersInFoulTrouble({
  homeId,
  awayId,
  homeCode,
  awayCode,
  homeLogo,
  awayLogo,
  homePlayers,
  awayPlayers,
  isDark,
  league = "NBA",
}: Props) {
  const styles = foulTroubleStyles(isDark);

  const tabs = useMemo(
    () => [
      { id: awayId, label: awayCode, logo: awayLogo },
      { id: homeId, label: homeCode, logo: homeLogo },
    ],
    [homeId, awayId, homeCode, awayCode, homeLogo, awayLogo],
  );

  const tabIds = tabs.map((t) => t.id);
  const [selectedTeamId, setSelectedTeamId] = useState(tabIds[0] ?? "");
  const players = useMemo(
    () => [...homePlayers, ...awayPlayers],
    [homePlayers, awayPlayers],
  );
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p: Player) => !selectedTeamId || p.teamId === selectedTeamId)
      .sort((a: Player, b: Player) => b.fouls - a.fouls);
  }, [players, selectedTeamId]);

  const renderRow = ({ item, index }: { item: Player; index: number }) => {
    const isLast = index === filteredPlayers.length - 1;
    const isFouledOut = league === "NBA" ? item.fouls >= 6 : item.fouls >= 5;

    return (
      <View style={[styles.playerRow, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.left}>
          <View style={styles.avatarWrapper}>
            {item.avatarUrl && (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            )}
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.jersey}>#{item.jersey}</Text>
          </View>
        </View>

        <Text style={styles.value}>
          {isFouledOut ? "Fouled Out" : item.fouls}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.constainer}>
      <HeadingTwo isDark={isDark}>In Foul Trouble</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabIds}
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
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
          isDark={isDark}
        />

        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No Players</Text>}
        />
      </View>
    </View>
  );
}

const foulTroubleStyles = (isDark: boolean) =>
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
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    left: { flexDirection: "row", alignItems: "center", flex: 1 },
    avatar: {
      width: 52,
      height: 52,
    },
    avatarWrapper: {
      width: 60,
      height: 60,
      borderRadius: 100,
      paddingTop: 10,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    playerInfo: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    name: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: 8,
    },
    jersey: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginLeft: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    value: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
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
