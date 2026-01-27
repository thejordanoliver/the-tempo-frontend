// components/NBA/DraftCard.tsx
import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamByESPNId } from "constants/teams";
import { getTeamByESPNId as getNFLTeamByESPNId } from "constants/teamsNFL";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

export type DraftPick = {
  pick: number;
  overall: number;
  round: number;
  traded?: boolean;
  tradeNote?: string;
  status?: string;
  teamId: string;
  athlete: {
    id: string;
    alternativeId: string;
    name: string;
    height: string;
    weight: string;
    positionId: string;
    college: string;
    collegeId: string;
    headshot?: string;

    link?: string;
  } | null;
};

type Props = {
  player: DraftPick;
  index: number;
  league: "nba" | "nfl";
};

const POSITION_MAP: Record<string, string> = {
  "1": "PG",
  "2": "SG",
  "3": "G",
  "5": "SF",
  "6": "PF",
  "7": "F",
  "9": "C",
};

const NFL_POSITION_MAP: Record<string, string> = {
  "8": "QB",
  "9": "RB",
  "1": "WR",
  "7": "TE",
  "10": "FB",
  "46": "OT",
  "47": "OG",
  "91": "C",
  "32": "DT",
  "30": "LB",
  "264": "EDGE",
  "29": "CB",
  "36": "S",
  "96": "LS",
  "80": "PK",
  "94": "P",
};

export default function DraftCard({ player, index, league }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();

  const isNFL = league === "nfl";
  const team = isNFL
    ? getNFLTeamByESPNId(player.teamId)
    : getTeamByESPNId(player.teamId);
  const logo = isDark ? team?.logoLight || team?.logo : team?.logo;

  // Animation
  const slideX = useRef(new Animated.Value(70)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const athlete = player.athlete;

  const headshotSource = athlete?.headshot
    ? { uri: athlete.headshot }
    : playerPlaceholder;

  const positionAbbr =
    league === "nba"
      ? POSITION_MAP[athlete?.positionId ?? ""] ?? athlete?.positionId
      : NFL_POSITION_MAP[athlete?.positionId ?? ""] ?? athlete?.positionId;

  return (
    <View style={styles.cardWrapper}>
      {/* Background logo */}
      {logo && (
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fade, transform: [{ translateX: slideX }] },
          ]}
        >
          <Image source={logo} style={styles.backgroundLogo} />
        </Animated.View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={
          isDark
            ? [
                "rgba(29,29,29,0.9)",
                "rgba(29,29,29,1)",
                "rgba(29,29,29,1)",
                "rgba(29,29,29,0.5)",
                "rgba(29,29,29,0.1)",
                "transparent",
              ]
            : [
                "rgba(255,255,255,0.9)",
                "rgba(255,255,255,1)",
                "rgba(255,255,255,1)",
                "rgba(255,255,255,0.5)",
                "rgba(255,255,255,0.1)",
                "transparent",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}
      />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.playerHeader}>
            <Image source={headshotSource} style={styles.headshot} />

            <Text style={styles.name}>{athlete?.name}</Text>

            <View style={styles.divider} />

            <Text style={styles.positionText}>{positionAbbr}</Text>
          </View>

          {/* Ranking badge */}
          <View style={styles.rankingBadge}>
            <Text style={styles.rankingText}>#{player.overall}</Text>
          </View>
        </View>

        {/* Bio row 1 */}
        <View style={styles.playerBioRow}>
          <Text style={styles.subText}>{athlete?.college || "N/A"}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>{athlete?.height || "N/A"}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>{athlete?.weight || "N/A"}</Text>
        </View>

        {/* Bio row 2 */}
        <View style={styles.playerBioRow}>
          <Text style={styles.subText}>RD: {player.round}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>Pick: {player.pick}</Text>
        </View>
        {/* Bio row 2 */}
        {player.traded && (
          <View style={styles.playerBioRow}>
            <Text style={styles.tradeNoteText}>{player.tradeNote}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    cardWrapper: {
      overflow: "hidden",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      position: "relative",
    },

    logoContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: "45%",
      justifyContent: "center",
      alignItems: "flex-end",
      overflow: "hidden",
    },

    backgroundLogo: {
      height: "160%",
      aspectRatio: 1,
      opacity: 1,
      marginRight: -20,
    },

    cardGradient: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "175%",
    },

    cardContent: {
      padding: 12,
      gap: 4,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    headshot: {
      width: 50,
      height: 50,
      borderRadius: 25,
      paddingTop: 4,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    name: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },

    rankingBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: Colors.darkGray,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },

    rankingText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: Colors.white,
    },

    playerBioRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    positionText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      fontSize: 14,
    },

    divider: {
      width: 1,
      height: 18,
      marginHorizontal: 6,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.white : Colors.light.black,
      fontStyle: "italic",
    },
    tradeNoteText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.white : Colors.light.black,
      fontStyle: "italic",
    },
  });
