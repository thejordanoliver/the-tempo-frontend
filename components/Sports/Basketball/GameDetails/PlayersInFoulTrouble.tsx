import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import {
  FoulTrouble,
  FoulTroublePlayer,
} from "@/hooks/BasketballHooks/useBasketballGameDetails";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  homeId: number;
  awayId: number;
  homeCode: string | undefined;
  awayCode: string | undefined;
  homeLogo: any;
  awayLogo: any;
  foulTrouble: FoulTrouble[];
  isDark: boolean;
  league: string;
  state: string | null;
};

export default function PlayersInFoulTrouble({
  homeId,
  awayId,
  homeCode,
  awayCode,
  homeLogo,
  awayLogo,
  foulTrouble,
  isDark,
  league = "NBA",
  state,
}: Props) {
  const styles = foulTroubleStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const awayPlayers = useMemo(
    () => foulTrouble?.[0]?.players ?? [],
    [foulTrouble],
  );

  const homePlayers = useMemo(
    () => foulTrouble?.[1]?.players ?? [],
    [foulTrouble],
  );

  const filteredPlayers = useMemo(() => {
    if (selectedTab === "home") {
      return homePlayers;
    }

    if (selectedTab === "away") {
      return awayPlayers;
    }

    return [...awayPlayers, ...homePlayers];
  }, [selectedTab, homePlayers, awayPlayers]);

  const normalizedLeague = league.trim().toUpperCase();

  const foulLimit =
    normalizedLeague === "NBA" || normalizedLeague === "WNBA" ? 6 : 5;

  const renderRow = ({
    item,
    index,
  }: {
    item: FoulTroublePlayer;
    index: number;
  }) => {
    const isLast = index === filteredPlayers.length - 1;
    const isFouledOut = item.fouls >= foulLimit;

    return (
      <View style={[styles.playerRow, isLast && styles.lastPlayerRow]}>
        <View style={styles.left}>
          <View style={styles.avatarWrapper}>
            {item.headshot ? (
              <Image source={{ uri: item.headshot }} style={styles.avatar} />
            ) : null}
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.shortName}
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

  if (state !== "in") {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>In Foul Trouble</HeadingTwo>

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

        <FlatList<FoulTroublePlayer>
          data={filteredPlayers}
          keyExtractor={(item, index) =>
            item.id != null ? String(item.id) : `foul-trouble-${index}`
          }
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
      fontFamily: Fonts.SEMIBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: 8,
      flexShrink: 1,
    },
    jersey: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      marginLeft: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    value: {
      fontSize: 16,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    emptyText: {
      fontSize: 16,
      color: Colors.midTone,
      textAlign: "center",
      fontFamily: Fonts.REGULAR,
      padding: 12,
    },
  });
