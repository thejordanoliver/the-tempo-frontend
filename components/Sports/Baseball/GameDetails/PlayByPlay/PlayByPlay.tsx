import HeadingTwo from "@/components/Headings/HeadingTwo";
import type {
  BaseballPlay,
  BaseballPlayAthlete,
  BaseballPlayParticipant,
  BaseballSituation,
} from "@/hooks/BaseballHooks/useBaseballGameDetails";
import { PlayByPlayStyles } from "@/styles/GameDetailStyles/PlayByPlayStyles";
import PlayByPlayHeader from "components/Sports/PlayByPlay/PlayByPlayHeader";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadingTransition,
  useReducedMotion,
} from "react-native-reanimated";
import { getActiveAtBatPlays } from "../../../../../utils/sports/baseball/baseball-play-animation-utils";
import BaseballFieldPlay, {
  BASEBALL_FIELD_ASPECT_RATIO,
} from "./BaseballField";

const VIEWBOX_WIDTH = 600;
const INITIAL_FIELD_HORIZONTAL_INSET = 26;

const PARTICIPANT_LABELS: Record<string, string> = {
  batter: "Batter",
  pitcher: "Pitcher",
  runner: "Runner",
  fielder: "Fielder",
  onfirst: "Runner",
  onsecond: "Runner",
  onthird: "Runner",
};

export type PlayByPlayProps = {
  width?: number;
  awayCode?: string;
  homeCode?: string;
  venueId?: string | number | null;
  awayTeamId?: string | number | null;
  homeTeamId?: string | number | null;
  homeLogo?: ImageSourcePropType;
  awayLogo?: ImageSourcePropType;
  play?: BaseballPlay | null;
  plays?: BaseballPlay[];
  situation?: BaseballSituation | null;
  state: string | null;
  isDark?: boolean;
};

function getAthleteName(athlete?: BaseballPlayAthlete | null): string | null {
  if (!athlete) {
    return null;
  }

  const fallback =
    [athlete.firstName, athlete.lastName].filter(Boolean).join(" ").trim() ||
    null;

  return (
    athlete.shortName ?? athlete.displayName ?? athlete.fullName ?? fallback
  );
}

function getHeadshotUri(headshot: unknown): string | null {
  if (!headshot) {
    return null;
  }

  if (typeof headshot === "string") {
    return headshot.trim() || null;
  }

  if (typeof headshot === "object" && headshot !== null) {
    const href = (
      headshot as {
        href?: unknown;
      }
    ).href;

    if (typeof href === "string" && href.trim()) {
      return href.trim();
    }
  }

  return null;
}

function getParticipantLabel(type?: string | null): string {
  const normalized = type?.trim().toLowerCase() ?? "";

  return (PARTICIPANT_LABELS[normalized] ?? normalized) || "Player";
}

function getPlayParticipants(participants?: BaseballPlayParticipant[]) {
  if (!Array.isArray(participants)) {
    return [];
  }

  const seen = new Set<string>();

  const unique: {
    key: string;
    role: string;
    name: string;
    headshotUri: string;
  }[] = [];

  for (let index = 0; index < participants.length; index += 1) {
    const participant = participants[index];

    const athlete = participant?.athlete;

    const name = getAthleteName(athlete);

    if (!name) {
      continue;
    }

    const role = getParticipantLabel(participant.type);

    const id =
      athlete?.id != null ? String(athlete.id) : name.trim().toLowerCase();

    /*
     * Athlete ID is enough here.
     *
     * This stops the same athlete from appearing twice
     * as batter + base runner.
     */
    const identity = id;

    if (seen.has(identity)) {
      continue;
    }

    seen.add(identity);

    unique.push({
      key: identity,
      role,
      name,
      headshotUri:
        getHeadshotUri(athlete?.headshot) ??
        "https://res.cloudinary.com/dm3qtdhag/image/upload/v1781892365/playerPlaceholder_vi9zk3.png",
    });

    if (unique.length === 3) {
      break;
    }
  }

  return unique;
}

export function getLatestDescriptivePlay(
  plays: BaseballPlay[],
  lastPlay?: BaseballPlay | null,
): BaseballPlay | null {
  if (lastPlay?.text?.trim()) {
    return lastPlay;
  }

  if (lastPlay) {
    const relatedPlays = getActiveAtBatPlays(plays, lastPlay);

    for (let index = relatedPlays.length - 1; index >= 0; index -= 1) {
      const relatedPlay = relatedPlays[index];

      if (relatedPlay.text?.trim()) {
        return relatedPlay;
      }
    }
  }

  for (let index = plays.length - 1; index >= 0; index -= 1) {
    const play = plays[index];

    if (play.text?.trim()) {
      return play;
    }
  }

  return lastPlay ?? null;
}

function PlayByPlay({
  width = VIEWBOX_WIDTH,
  awayCode = "AWAY",
  homeCode = "HOME",
  venueId,
  awayTeamId,
  homeTeamId,
  homeLogo,
  awayLogo,
  play,
  plays = [],
  situation,
  state,
  isDark = true,
}: PlayByPlayProps) {
  const styles = PlayByPlayStyles(isDark);
  const reducedMotion = useReducedMotion();

  const { width: windowWidth } = useWindowDimensions();

  const [availableFieldWidth, setAvailableFieldWidth] = useState<number | null>(
    null,
  );

  const fallbackFieldWidth = Math.max(
    0,
    windowWidth - INITIAL_FIELD_HORIZONTAL_INSET,
  );

  const maxFieldWidth = Math.max(0, availableFieldWidth ?? fallbackFieldWidth);

  const fieldWidth = Math.min(width, maxFieldWidth);

  const fieldHeight = fieldWidth * BASEBALL_FIELD_ASPECT_RATIO;

  const handleFieldLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth <= 0) {
      return;
    }

    setAvailableFieldWidth((current) =>
      current !== null && Math.abs(current - nextWidth) < 1
        ? current
        : nextWidth,
    );
  }, []);

  const descriptivePlay = useMemo(
    () => getLatestDescriptivePlay(plays, play),
    [play, plays],
  );

  const playInfo = useMemo(() => {
    if (!play) {
      return null;
    }

    const count = play.resultCount ?? play.pitchCount ?? situation ?? null;
    const participantSource = play.participants?.length
      ? play.participants
      : descriptivePlay?.participants;

    return {
      playKey: descriptivePlay?.id ?? play.id,

      playText: descriptivePlay?.text?.trim() || null,

      participants: getPlayParticipants(participantSource ?? undefined),

      inning: play.period?.number ?? null,

      half: play.period?.type ?? null,

      outs: play.outs ?? situation?.outs ?? 0,

      balls: count?.balls ?? 0,

      strikes: count?.strikes ?? 0,
    };
  }, [descriptivePlay, play, situation]);

  const possessionLogo = useMemo(() => {
    if (!play?.team) {
      return null;
    }

    const playTeamId = String(play.team.id ?? "");

    if (homeTeamId != null && playTeamId === String(homeTeamId)) {
      return homeLogo;
    }

    if (awayTeamId != null && playTeamId === String(awayTeamId)) {
      return awayLogo;
    }

    /*
     * The team on a pitch event may be the
     * batting OR fielding team depending on
     * the play type, so don't invent a logo
     * when the IDs cannot be matched.
     */
    return null;
  }, [awayLogo, awayTeamId, homeLogo, homeTeamId, play]);

  if (!playInfo) {
    return null;
  }
  if (state === "pre" || state === "post") {
    return null;
  }

  const half =
    playInfo.half === "Bottom"
      ? "Bot"
      : playInfo.half === "Top"
        ? "Top"
        : playInfo.half;

  const inning = playInfo.inning;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>

      <Animated.View
        style={styles.wrapper}
        layout={reducedMotion ? undefined : FadingTransition.duration(180)}
      >
        {/* Header */}
        <PlayByPlayHeader
          isDark={isDark}
          title={descriptivePlay?.type?.text || play?.type?.text || "At bat"}
          logo={possessionLogo}
          period={[half, inning]
            .filter((value) => value != null && value !== "")
            .join(" ")}
          isLive={state === "in"}
        />
        <View style={styles.situationRow}>
          <View style={styles.situationItem}>
            <Text style={styles.eyebrow}>Count</Text>
            <Text
              style={styles.situationValue}
              accessibilityLabel={`${playInfo.balls} balls, ${playInfo.strikes} strikes`}
            >
              {playInfo.balls}–{playInfo.strikes}
            </Text>
          </View>
          <View style={styles.situationItem}>
            <Text style={styles.eyebrow}>Outs</Text>
            <Text style={styles.situationValue}>{playInfo.outs}</Text>
          </View>
        </View>

        {/* Play description */}
        {playInfo.playText ? (
          <Animated.View
            key={`detail-${playInfo.playKey}`}
            entering={reducedMotion ? undefined : FadeInDown.duration(220)}
            exiting={reducedMotion ? undefined : FadeOutUp.duration(140)}
            layout={reducedMotion ? undefined : FadingTransition.duration(180)}
            style={styles.detailRow}
          >
            <Text style={styles.detailText} selectable>
              {playInfo.playText}
            </Text>
          </Animated.View>
        ) : null}

        {/* Baseball field */}
        <View style={styles.fieldFrame} onLayout={handleFieldLayout}>
          <BaseballFieldPlay
            width={fieldWidth}
            height={fieldHeight}
            awayCode={awayCode}
            homeCode={homeCode}
            venueId={venueId}
            play={play}
            plays={plays}
            situation={situation}
          />
        </View>

        {/* Participants */}
        {playInfo.participants.length > 0 ? (
          <Animated.View
            key={`participants-${playInfo.playKey}`}
            entering={reducedMotion ? undefined : FadeInDown.duration(240)}
            exiting={reducedMotion ? undefined : FadeOutUp.duration(140)}
            layout={reducedMotion ? undefined : FadingTransition.duration(180)}
            style={styles.participantsRow}
          >
            {playInfo.participants.map((participant, index) => (
              <Animated.View
                key={participant.key}
                entering={
                  reducedMotion
                    ? undefined
                    : FadeInDown.delay(index * 45).duration(200)
                }
                style={styles.participantItem}
              >
                <View style={styles.participantAvatar}>
                  <Image
                    source={{
                      uri: participant.headshotUri,
                    }}
                    style={styles.participantHeadshot}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.participantTextGroup}>
                  <Text
                    style={styles.participantRole}
                    numberOfLines={1}
                    selectable
                  >
                    {participant.role}
                  </Text>

                  <Text
                    style={styles.participantName}
                    numberOfLines={1}
                    selectable
                  >
                    {participant.name}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

export default memo(PlayByPlay);
