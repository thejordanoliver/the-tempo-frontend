import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useMemo, useState } from "react";
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
  gameStatusDescription: string;
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
  gameStatusDescription,
}: Props) {
  const styles = foulTroubleStyles(isDark);

  const tabs = useMemo(
    () => [
      { id: awayId, label: awayCode, logo: awayLogo },
      { id: homeId, label: homeCode, logo: homeLogo },
    ],
    [homeId, awayId, homeCode, awayCode, homeLogo, awayLogo],
  );

  const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);

  const [selectedTeamId, setSelectedTeamId] = useState(tabIds[0] ?? "");

  useEffect(() => {
    if (!selectedTeamId || !tabIds.includes(selectedTeamId)) {
      setSelectedTeamId(tabIds[0] ?? "");
    }
  }, [selectedTeamId, tabIds]);

  const players = useMemo(
    () => [...homePlayers, ...awayPlayers],
    [homePlayers, awayPlayers],
  );

  const filteredPlayers = useMemo(() => {
    return players
      .filter((player) => !selectedTeamId || player.teamId === selectedTeamId)
      .sort((a, b) => b.fouls - a.fouls);
  }, [players, selectedTeamId]);

  const renderRow = ({ item, index }: { item: Player; index: number }) => {
    const isLast = index === filteredPlayers.length - 1;
    const foulLimit = league === "NBA" ? 6 : 5;
    const isFouledOut = item.fouls >= foulLimit;

    return (
      <View style={[styles.playerRow, isLast && styles.lastPlayerRow]}>
        <View style={styles.left}>
          <View style={styles.avatarWrapper}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : null}
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {item.jersey ? (
              <Text style={styles.jersey}>#{item.jersey}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.value}>
          {isFouledOut ? "Fouled Out" : item.fouls}
        </Text>
      </View>
    );
  };

  if (
    gameStatusDescription === "Scheduled" ||
    gameStatusDescription === "Final"
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>In Foul Trouble</HeadingTwo>

      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabIds}
          selected={selectedTeamId}
          onTabPress={setSelectedTeamId}
          renderLabel={(tabKey, isSelected, tabStyles) => {
            const tab = tabs.find((teamTab) => teamTab.id === tabKey);

            return (
              <View style={styles.tabLabel}>
                {tab?.logo ? (
                  <Image
                    source={tab.logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                ) : null}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                  numberOfLines={1}
                >
                  {tab?.label ?? ""}
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
    container: {},
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 10,
      overflow: "hidden",
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
    lastPlayerRow: {
      borderBottomWidth: 0,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      paddingRight: 12,
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
    avatar: {
      width: 52,
      height: 52,
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "baseline",
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: 8,
      flexShrink: 1,
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
      minWidth: 0,
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
