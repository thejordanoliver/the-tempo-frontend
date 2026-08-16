// components/Sports/Football/PlayByPlay.tsx
import { Colors, Fonts } from "@/constants/styles";
import type {
  FootballDrives,
  FootballPlayAthlete,
  FootballPlayParticipant,
  PlayObject,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import HeadingTwo from "@/components/Headings/HeadingTwo";
import { formatPeriod } from "@/utils/games";
import FootballFieldPlay from "./FootballField";

type FootballFieldProps = {
  width?: number;
  height?: number;

  awayCode?: string;
  homeCode?: string;

  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;

  awayTeamId?: string | number | null;
  homeTeamId?: string | number | null;

  playId?: string | number | null;
  playSequenceNumber?: string | number | null;

  drives?: FootballDrives | null;
  play?: PlayObject | null;

  awayColor?: string;
  homeColor?: string;

  showPlay?: boolean;
  isDark?: boolean;
  state: string;
};

const VIEWBOX_WIDTH = 600;
const INITIAL_FIELD_HORIZONTAL_INSET = 26;

const PARTICIPANT_LABELS: Record<string, string> = {
  passer: "Passer",
  rusher: "Rusher",
  receiver: "Receiver",
  tackler: "Tackler",
  kicker: "Kicker",
  punter: "Punter",
  returner: "Returner",
};

function getAthleteName(athlete?: FootballPlayAthlete | null) {
  const fallbackName =
    [athlete?.firstName, athlete?.lastName].filter(Boolean).join(" ").trim() ||
    null;

  return (
    athlete?.shortName ??
    athlete?.displayName ??
    athlete?.fullName ??
    fallbackName
  );
}

function getHeadshotUri(headshot: unknown) {
  if (!headshot) return null;

  if (typeof headshot === "string") {
    const trimmedHeadshot = headshot.trim();

    return trimmedHeadshot || null;
  }

  if (typeof headshot === "object") {
    const href = (headshot as { href?: unknown }).href;

    return typeof href === "string" && href.trim() ? href : null;
  }

  return null;
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "?";
}

function getParticipantLabel(type?: string | null) {
  const normalizedType = type?.trim().toLowerCase() ?? "";

  if (!normalizedType) return "Player";

  return (
    PARTICIPANT_LABELS[normalizedType] ??
    normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1)
  );
}

function getPlayParticipants(participants?: FootballPlayParticipant[]) {
  if (!Array.isArray(participants)) {
    return [];
  }

  const seenParticipants = new Set<string>();
  const uniqueParticipants = [];

  for (const [index, participant] of participants.entries()) {
    const athlete = participant?.athlete;
    const name = getAthleteName(athlete);

    if (!name) continue;

    const normalizedType = participant.type?.trim().toLowerCase() || "player";

    const athleteIdentifier =
      athlete?.id != null
        ? String(athlete.id)
        : `${name.trim().toLowerCase()}-${index}`;

    const identity = `${normalizedType}-${athleteIdentifier}`;

    // ESPN can repeat the same athlete and role in participants.
    if (seenParticipants.has(identity)) {
      continue;
    }

    seenParticipants.add(identity);

    uniqueParticipants.push({
      key: identity,
      role: getParticipantLabel(participant.type),
      name,
      headshotUri:
        getHeadshotUri(athlete?.headshot) ??
        "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892365/playerPlaceholder_vi9zk3.png",
      initials: getInitials(name),
    });

    if (uniqueParticipants.length === 3) {
      break;
    }
  }

  return uniqueParticipants;
}

function PlayByPlay({
  width = VIEWBOX_WIDTH,
  height = 150,
  awayCode = "AWAY",
  homeCode = "HOME",
  homeLogo,
  awayLogo,
  awayTeamId,
  homeTeamId,
  playId,
  playSequenceNumber,
  drives,
  play: playData,
  awayColor = Colors.midTone,
  homeColor = Colors.midTone,
  showPlay = true,
  isDark = true,
  state,
}: FootballFieldProps) {
  const styles = PlayByPlayStyles(isDark);
  const { width: windowWidth } = useWindowDimensions();
  const [availableFieldWidth, setAvailableFieldWidth] = useState<number | null>(
    null,
  );

  const isLive = state.toLowerCase() === "in";
  const fallbackFieldWidth = Math.max(
    0,
    windowWidth - INITIAL_FIELD_HORIZONTAL_INSET,
  );
  const maxFieldWidth = Math.max(0, availableFieldWidth ?? fallbackFieldWidth);
  const fieldWidth = Math.min(width, maxFieldWidth);
  const fieldHeight = width > 0 ? height * (fieldWidth / width) : height;

  const handleFieldLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth <= 0) return;

    setAvailableFieldWidth((currentWidth) =>
      currentWidth !== null && Math.abs(currentWidth - nextWidth) < 1
        ? currentWidth
        : nextWidth,
    );
  }, []);

  const playInfo = useMemo(() => {
    if (!playData) return null;

    const period = formatPeriod({ period: Number(playData.period?.number) });
    const clock = playData.clock?.displayValue ?? null;

    const downDistance =
      playData.start?.shortDownDistanceText ??
      playData.start?.downDistanceText ??
      null;

    const fieldPosition = playData.start?.possessionText ?? null;
    const playText = playData.text ?? playData.shortText ?? null;
    const isScoringPlay = playData.scoringPlay;
    const isTurnover = playData.isTurnover;
    const isPenalty = playData.isPenalty;
    const participants = getPlayParticipants(playData.participants);
    const playType =
      playData.type?.text ?? playData.type?.abbreviation ?? "Play";

    return {
      period,
      clock,
      downDistance,
      fieldPosition,
      isScoringPlay,
      isTurnover,
      isPenalty,
      playType,
      playText,
      participants,
    };
  }, [playData]);

  const possessionTeam =
    playData?.start?.team ??
    playData?.end?.team ??
    drives?.current?.at(-1)?.team ??
    null;

  const possessionTeamId = String(
    possessionTeam?.id ?? possessionTeam?.espnId ?? "",
  );

  const possessionCode = (
    possessionTeam?.abbreviation ??
    possessionTeam?.code ??
    ""
  ).toUpperCase();

  const isHomePossession =
    possessionTeamId === String(homeTeamId ?? "") ||
    possessionCode === homeCode.toUpperCase();

  const isAwayPossession =
    possessionTeamId === String(awayTeamId ?? "") ||
    possessionCode === awayCode.toUpperCase();

  const possessionLogo = isHomePossession
    ? homeLogo
    : isAwayPossession
      ? awayLogo
      : null;

  const isFourthDown = playInfo?.downDistance?.includes("4th");
  const isTurnover = playInfo?.isTurnover;
  const isScoringPlay = playInfo?.isScoringPlay;
  const playText = playInfo?.playText;
  const possessionText =
    playInfo &&
    ([playInfo.downDistance, playInfo.fieldPosition]
      .filter(Boolean)
      .join(" @ ") ||
      playInfo.playType);
  const period = playInfo?.period;
  const clock = playInfo?.clock;
  const playParticipants = playInfo?.participants ?? [];

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          {playInfo && (
            <>
              <Text
                style={[styles.titleText, isFourthDown && styles.fourthDown]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {possessionText}
              </Text>
              {possessionLogo && (
                <Image
                  source={possessionLogo}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              )}
            </>
          )}
        </View>
        <View style={styles.liveRow}>
          {isLive ? <View style={styles.liveDot} /> : null}

          {period && clock && (
            <>
              <Text style={styles.gameTime}>{period}</Text>
              <View style={styles.divider} />
              <Text style={styles.gameTime}>{clock}</Text>
            </>
          )}
        </View>
        <View style={styles.detailRow}>
          {playText && (
            <Text
              style={[
                styles.detailText,
                isScoringPlay && styles.scoringPlay,
                isTurnover && styles.turnover,
              ]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {playText}
            </Text>
          )}
        </View>

        <View style={styles.fieldFrame} onLayout={handleFieldLayout}>
          <FootballFieldPlay
            width={fieldWidth}
            height={fieldHeight}
            awayCode={awayCode}
            homeCode={homeCode}
            awayTeamId={awayTeamId}
            homeTeamId={homeTeamId}
            awayColor={awayColor}
            homeColor={homeColor}
            drives={drives}
            play={playData}
            playId={playId}
            playSequenceNumber={playSequenceNumber}
            showPlay={Boolean(showPlay)}
            isDark={isDark}
            state={state}
          />
        </View>
        {playParticipants.length > 0 && (
          <View style={styles.participantsRow}>
            {playParticipants.map((participant) => (
              <View key={participant.key} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  {participant.headshotUri && (
                    <Image
                      source={{ uri: participant.headshotUri }}
                      style={styles.participantHeadshot}
                      resizeMode="cover"
                    />
                  )}
                </View>

                <View style={styles.participantTextGroup}>
                  <Text style={styles.participantRole} numberOfLines={1}>
                    {participant.role}
                  </Text>

                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export const PlayByPlayStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {},
    wrapper: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
      backgroundColor: isDark ? Colors.dark.background : Colors.white,
      gap: 6,
    },
    fieldFrame: {
      alignSelf: "stretch",
      alignItems: "center",
      marginTop: -2,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    liveRow: {
      minHeight: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    participantsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingTop: 12,
      borderColor: isDark ? Colors.white : Colors.black,
      justifyContent: "space-evenly",
      gap: 8,
    },
    participantItem: {
      minWidth: 110,
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
      gap: 6,
    },
    participantAvatar: {
      width: 40,
      height: 40,
      borderRadius: 999,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    participantHeadshot: {
      width: "100%",
      height: "100%",
    },
    participantInitials: {
      fontSize: 12,
      lineHeight: 14,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    participantTextGroup: {
      minWidth: 0,
      flexShrink: 1,
    },
    participantRole: {
      fontSize: 10,
      lineHeight: 12,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    participantName: {
      fontSize: 13,
      lineHeight: 15,
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    smallDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
      opacity: 0.7,
    },
    divider: {
      width: 1,
      height: 14,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
      opacity: 0.7,
    },
    eyebrow: {
      fontSize: 11,
      fontFamily: Fonts.MEDIUM,
      textTransform: "uppercase",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    gameTime: {
      fontSize: 14,
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    titleText: {
      flex: 1,
      fontSize: 18,
      lineHeight: 22,
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    fourthDown: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    scoringPlay: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    turnover: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    detailText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    headerLogo: {
      width: 44,
      height: 44,
    },
  });

export default memo(PlayByPlay);
