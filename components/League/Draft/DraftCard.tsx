import {
  getSportsCardGradient,
  sportsCardBackgroundStyles,
} from "styles/SportsCardBackgroundStyles";
// components/NBA/DraftCard.tsx
import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export type DraftPick = {
  pick: number;
  overall: number;
  round: number;
  traded?: boolean;
  tradeNote?: string;
  status?: "ON_THE_CLOCK" | "SELECTION_MADE" | "PICK_IS_IN";
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
  league: string;
  isFirstOnTheClock?: boolean;
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

export default function DraftCard({
  player,
  index,
  league,
  isFirstOnTheClock,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = DraftCardStyles(isDark);
  const isNFL = league === "nfl";
  const isWNBA = league === "wnba";
  const team = isNFL
    ? getNFLTeam(player.teamId)
    : isWNBA
      ? getWNBATeam(player.teamId)
      : getNBATeam(player.teamId);

  const logo = isWNBA
    ? getWNBATeamLogo(team?.id, isDark)
    : isNFL
      ? getNFLTeamLogo(team?.id, isDark)
      : getNBATeamLogo(team?.id, isDark);

  const athlete = player.athlete;
  const pickIsIn = player.status === "PICK_IS_IN";
  const isOnTheClock = Boolean(isFirstOnTheClock) && !pickIsIn;
  const visualState = isOnTheClock
    ? "ON_THE_CLOCK"
    : pickIsIn
      ? "PICK_IS_IN"
      : player.status === "SELECTION_MADE" || athlete
        ? "PICKED"
        : "UPCOMING";
  const animationKey = [
    player.overall,
    player.pick,
    player.teamId,
    athlete?.id ?? "no-athlete",
    visualState,
  ].join(":");

  const [cardSlideX] = useState(() => new Animated.Value(70));
  const [cardFade] = useState(() => new Animated.Value(0));
  const [slideX] = useState(() => new Animated.Value(70));
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const delay = Math.min(index, 8) * 60;

    cardSlideX.setValue(70);
    cardFade.setValue(0);
    slideX.setValue(70);
    fade.setValue(0);

    const animation = Animated.parallel([
      Animated.timing(cardSlideX, {
        toValue: 0,
        duration: 650,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 650,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 650,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [animationKey, cardFade, cardSlideX, fade, index, slideX]);

  const headshotSource = athlete?.headshot
    ? { uri: athlete.headshot }
    : playerPlaceholder;
  const positionAbbr =
    league === "nba"
      ? (POSITION_MAP[athlete?.positionId ?? ""] ?? athlete?.positionId)
      : (NFL_POSITION_MAP[athlete?.positionId ?? ""] ?? athlete?.positionId);

  const renderBackground = () => (
    <>
      {logo && (
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fade, transform: [{ translateX: slideX }] },
          ]}
        >
          <Image
            source={logo}
            style={styles.backgroundLogo}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <LinearGradient
        {...getSportsCardGradient(isDark)}
        style={styles.cardGradient}
      />
    </>
  );

  const renderStatusCard = (label: "ON THE CLOCK" | "PICK IS IN") => (
    <View style={styles.cardContent}>
      <View style={styles.row}>
        <View
          style={[
            styles.playerHeader,
            { flex: 1, justifyContent: "space-between" },
          ]}
        >
          <Text style={styles.pickIsIn}>{label}</Text>
          <View style={styles.rankingBadge}>
            <Text style={styles.rankingText}>#{player.overall}</Text>
            <Text style={styles.rankLabel}>OVERALL</Text>
          </View>
        </View>
      </View>

      <Text style={styles.subText}>
        {team?.name ?? "Team unavailable"} · Round {player.round} · Pick{" "}
        {player.pick}
      </Text>
    </View>
  );

  const renderPickedCard = () => (
    <View style={styles.cardContent}>
      <View style={styles.row}>
        <View style={styles.playerHeader}>
          <Image source={headshotSource} style={styles.headshot} />

          <View style={styles.playerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {athlete?.name ?? "Awaiting selection"}
            </Text>
            <Text style={styles.positionText}>
              {athlete ? (positionAbbr ?? "N/A") : "Upcoming pick"}
            </Text>
          </View>
        </View>

        <View style={styles.rankingBadge}>
          <Text style={styles.rankingText}>#{player.overall}</Text>
          <Text style={styles.rankLabel}>OVERALL</Text>
        </View>
      </View>

      <View style={styles.playerBioRow}>
        <Text style={[styles.subText, styles.college]} numberOfLines={1}>
          {athlete?.college || "N/A"}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.subText}>{athlete?.height || "N/A"}</Text>
        <View style={styles.divider} />
        <Text style={styles.subText}>{athlete?.weight || "N/A"}</Text>
      </View>

      <View style={styles.pickDetails}>
        <Text style={[styles.subText, styles.teamName]} numberOfLines={1}>
          {team?.name ?? "Team unavailable"}
        </Text>
        <Text style={styles.subText}>RD: {player.round}</Text>
        <View style={styles.divider} />
        <Text style={styles.subText}>Pick: {player.pick}</Text>
      </View>

      {player.traded && (
        <View style={styles.playerBioRow}>
          <Text style={styles.tradeNoteText}>{player.tradeNote}</Text>
        </View>
      )}
    </View>
  );

  const statusLabel = isOnTheClock
    ? "ON THE CLOCK"
    : pickIsIn
      ? "PICK IS IN"
      : null;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardFade,
          transform: [{ translateX: cardSlideX }],
        },
      ]}
    >
      {renderBackground()}
      {statusLabel ? renderStatusCard(statusLabel) : renderPickedCard()}
    </Animated.View>
  );
}

export const DraftCardStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const typography = globalStyles(isDark);
  
  return StyleSheet.create({
    cardWrapper: {
      position: "relative",
      marginHorizontal: 12,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: theme.itemBackground,
      overflow: "hidden",
    },
    logoContainer: sportsCardBackgroundStyles.logoContainer,
    backgroundLogo: sportsCardBackgroundStyles.backgroundLogo,
    cardGradient: sportsCardBackgroundStyles.cardGradient,
    cardContent: { gap: 10, padding: 12 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    playerHeader: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
      gap: 10,
    },
    playerInfo: { flex: 1, minWidth: 0, gap: 2 },
    headshot: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.background,
    },
    name: { ...typography.subtitle, fontFamily: Fonts.BOLD, fontSize: 18 },
    rankingBadge: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 50,
    },
    rankingText: {
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      color: theme.text,
    },
    rankLabel: { ...typography.label, fontSize: 9, lineHeight: 12 },
    playerBioRow: { flexDirection: "row", alignItems: "center" },
    pickDetails: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.transparentGray,
      gap: 6,
    },
    college: { flexShrink: 1 },
    teamName: { flex: 1, minWidth: 0, fontFamily: Fonts.MEDIUM },
    positionText: { ...typography.caption },
    divider: {
      width: StyleSheet.hairlineWidth,
      height: 12,
      marginHorizontal: 8,
      backgroundColor: theme.gray,
    },
    subText: { ...typography.caption },
    pickIsIn: { ...typography.title, flexShrink: 1, color: theme.green },
    tradeNoteText: {
      ...typography.caption,
      flexShrink: 1,
      color: theme.orange,
    },
  });
};
