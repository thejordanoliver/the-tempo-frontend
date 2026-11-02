import { Colors } from "@/constants/styles";
import type {
  FootballDrives,
  FootballPlayAthlete,
  FootballPlayParticipant,
  GameStatus,
  PlayObject,
} from "@/hooks/FootballHooks/useFootballGameDetails";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import HeadingTwo from "@/components/Headings/HeadingTwo";
import { PlayByPlayStyles } from "@/styles/GameDetailStyles/PlayByPlayStyles";
import { formatPeriod } from "@/utils/games/games";
import { isFootballRedZonePlay } from "@/utils/sports/football/footballRedZone";
import PlayByPlayHeader from "components/Sports/PlayByPlay/PlayByPlayHeader";
import FootballFieldPlay from "./FootballField";

type FootballFieldProps = {
  awayCode?: string;
  homeCode?: string;

  awayName?: string;
  homeName?: string;

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
  state: string | undefined | null;
  gameStatus?: GameStatus | null;
  league: string | undefined;
  neutralSite?: boolean;
};

// Preserve the phone layout's proportions while filling the card on any device.
const FIELD_ASPECT_RATIO = 420 / 130;
const INITIAL_FIELD_HORIZONTAL_INSET = 26;

type PlayBadgeVariant = "redZone" | "touchdown" | "fieldGoal";

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

function getScoreValue(value: unknown) {
  const scoreValue = Number(value);

  return Number.isFinite(scoreValue) ? scoreValue : null;
}

function getPlaySearchText(play?: PlayObject | null) {
  return [
    play?.type?.text,
    play?.type?.abbreviation,
    play?.scoringType?.name,
    play?.scoringType?.displayName,
    play?.scoringType?.abbreviation,
    play?.text,
    play?.shortText,
    play?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTouchdownPlay(play?: PlayObject | null) {
  if (!play) return false;

  const scoreValue = getScoreValue(play.scoreValue);
  const searchText = getPlaySearchText(play);

  return (
    scoreValue === 6 ||
    (Boolean(play.scoringPlay) && searchText.includes("touchdown"))
  );
}

function isMadeFieldGoalPlay(play?: PlayObject | null) {
  if (!play) return false;

  const scoreValue = getScoreValue(play.scoreValue);
  const searchText = getPlaySearchText(play);

  if (scoreValue === 3) {
    return true;
  }

  const isFieldGoal =
    searchText.includes("field goal") || /\bfg\b/.test(searchText);
  const isMissedOrBlocked =
    searchText.includes("no good") ||
    searchText.includes("miss") ||
    searchText.includes("blocked");

  return Boolean(play.scoringPlay && isFieldGoal && !isMissedOrBlocked);
}

function getPlayBadgeVariant(
  play?: PlayObject | null,
  state?: string | null,
  gameStatus?: GameStatus | null,
): PlayBadgeVariant | null {
  if (isTouchdownPlay(play)) return "touchdown";
  if (isMadeFieldGoalPlay(play)) return "fieldGoal";
  if (
    isFootballRedZonePlay(
      play,
      gameStatus ?? (state === "in" ? { state } : null),
    )
  ) {
    return "redZone";
  }

  return null;
}

function PlayByPlay({
  awayCode = "AWAY",
  homeCode = "HOME",
  awayName = "AWAY",
  homeName = "HOME",
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
  gameStatus,
  league = "nfl",
  neutralSite,
}: FootballFieldProps) {
  const styles = PlayByPlayStyles(isDark);
  const { width: windowWidth } = useWindowDimensions();
  const [availableFieldWidth, setAvailableFieldWidth] = useState<number | null>(
    null,
  );

  const isLive = state === "in";
  const fallbackFieldWidth = Math.max(
    0,
    windowWidth - INITIAL_FIELD_HORIZONTAL_INSET,
  );
  const fieldWidth = Math.max(0, availableFieldWidth ?? fallbackFieldWidth);
  const fieldHeight = fieldWidth / FIELD_ASPECT_RATIO;

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

    const playBadgeVariant = getPlayBadgeVariant(playData, state, gameStatus);
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
      playBadgeVariant,
      playType,
      playText,
      participants,
    };
  }, [gameStatus, playData, state]);

  const possessionTeam =
    playData?.start?.team ??
    playData?.end?.team ??
    drives?.current?.at(-1)?.team ??
    null;

  const possessionTeamId = String(possessionTeam?.id ?? "");

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
  const period = playInfo?.period;
  const clock = playInfo?.clock;
  const playParticipants = playInfo?.participants ?? [];

  if (state !== "in") return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>

      <View style={styles.wrapper}>
        <PlayByPlayHeader
          isDark={isDark}
          title={playInfo?.playType ?? "Waiting for updates"}
          logo={possessionLogo}
          period={period}
          clock={clock}
          isLive={isLive}
        />
        {playInfo?.downDistance || playInfo?.fieldPosition ? (
          <View style={styles.situationRow}>
            {playInfo.downDistance ? (
              <View style={styles.situationItem}>
                <Text style={styles.eyebrow}>Down & distance</Text>
                <Text
                  style={[
                    styles.situationValue,
                    isFourthDown && styles.fourthDown,
                  ]}
                >
                  {playInfo.downDistance}
                </Text>
              </View>
            ) : null}
            {playInfo.fieldPosition ? (
              <View style={styles.situationItem}>
                <Text style={styles.eyebrow}>Field position</Text>
                <Text style={styles.situationValue}>
                  {playInfo.fieldPosition}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.detailRow}>
          {playText && state === "in" && (
            <Text
              style={[
                styles.detailText,
                isScoringPlay && styles.scoringPlay,
                isTurnover && styles.turnover,
              ]}
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
            awayName={awayName}
            homeName={homeName}
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
            league={league}
            neutralSite={neutralSite}
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

export default memo(PlayByPlay);
