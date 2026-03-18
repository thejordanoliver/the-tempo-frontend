import HeadingTwo from "components/Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "components/TabBars/FixedWidthTabBar";
import { Colors, Fonts } from "constants/Styles";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

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
  lighter?: boolean;
  league: "NBA" | "CBB" | "WCBB";
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
  lighter = false,
  league = "NBA",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = foulTroubleStyles(isDark, lighter);

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
      <HeadingTwo>In Foul Trouble</HeadingTwo>

      <View style={styles.wrapper}>
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
                    source={tab.logo}
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
      borderColor: lighter
        ? Colors.white
        : isDark
          ? Colors.white
          : Colors.black,
    },

    playerInfo: {
      flexDirection: "row",
      alignItems: "baseline",
      
    },
    name: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: lighter
        ? Colors.dark.white
        : isDark
          ? Colors.dark.white
          : Colors.light.black,
      marginLeft: 8,
    },
    jersey: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginLeft: 4,
      color: lighter
        ? Colors.lightGray
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
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
