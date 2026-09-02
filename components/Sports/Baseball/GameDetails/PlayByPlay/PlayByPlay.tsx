import HeadingTwo from "@/components/Headings/HeadingTwo";
import type {
  BaseballPlay,
  BaseballPlayAthlete,
  BaseballPlayParticipant,
  BaseballSituation,
} from "@/hooks/BaseballHooks/useBaseballGameDetails";
import { PlayByPlayStyles } from "@/styles/GameDetailStyles/PlayByPlayStyles";
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
  Easing,
  FadeInDown,
  FadeOutUp,
  FadingTransition,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getActiveAtBatPlays } from "./baseball-play-animation-utils";
import BaseballFieldPlay, {
  BASEBALL_FIELD_ASPECT_RATIO,
} from "./BaseballField";

const VIEWBOX_WIDTH = 600;
const INITIAL_FIELD_HORIZONTAL_INSET = 26;

type PlayBadgeVariant = "hit" | "homeRun" | "strikeout" | "walk";

const PLAY_BADGE_LABELS: Record<PlayBadgeVariant, string> = {
  hit: "HIT",
  homeRun: "HOME RUN",
  strikeout: "STRIKEOUT",
  walk: "WALK",
};

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

function getPlaySearchText(play: BaseballPlay): string {
  return [
    play.text,
    play.type?.text,
    play.type?.type,
    play.alternativeType?.text,
    play.alternativeType?.type,
    play.alternativeType?.alternativeText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getPlayBadgeVariant(
  play?: BaseballPlay | null,
): PlayBadgeVariant | null {
  if (!play) {
    return null;
  }

  const text = getPlaySearchText(play);
  const playTypes = [play.type?.type, play.alternativeType?.type]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
  const resultCount = play.resultCount ?? play.pitchCount;
  const isStrikeType = playTypes.some((type) =>
    ["strike-looking", "strike-swinging"].includes(type),
  );
  const isBallType = playTypes.includes("ball");

  if (
    playTypes.includes("home-run") ||
    text.includes("home run") ||
    text.includes("home-run") ||
    text.includes("homered")
  ) {
    return "homeRun";
  }

  if (
    (isStrikeType && (resultCount?.strikes ?? 0) >= 3) ||
    text.includes("strikeout") ||
    text.includes("struck out") ||
    text.includes("struckout")
  ) {
    return "strikeout";
  }

  if (
    playTypes.includes("automatic-ball---ibb") ||
    (isBallType && (resultCount?.balls ?? 0) >= 4) ||
    text.includes("intentional walk") ||
    text.includes("walked")
  ) {
    return "walk";
  }

  if (
    playTypes.some((type) =>
      ["single", "bunt-single", "double", "triple"].includes(type),
    ) ||
    text.includes("single") ||
    text.includes("singled") ||
    text.includes("double") ||
    text.includes("doubled") ||
    text.includes("triple") ||
    text.includes("tripled")
  ) {
    return "hit";
  }

  return null;
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

function PlayStatusBadge({
  playKey,
  styles,
  variant,
}: {
  playKey: string;
  styles: ReturnType<typeof PlayByPlayStyles>;

  variant: PlayBadgeVariant;
}) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  const glowOpacity = useSharedValue(0.25);

  React.useEffect(() => {
    if (reducedMotion) {
      pulse.value = 1;
      glowOpacity.value = 0.25;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: 420,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, {
          duration: 420,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.2, {
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(glowOpacity);
    };
  }, [glowOpacity, playKey, pulse, reducedMotion]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pulse.value,
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutUp.duration(140)}
    >
      <Animated.View
        style={[styles.playStatusBadge, styles.baseballBadge, badgeStyle]}
        accessibilityLabel={PLAY_BADGE_LABELS[variant]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.playStatusGlow, styles.baseballGlow, glowStyle]}
        />

        <Text style={styles.playStatusText} numberOfLines={1}>
          {PLAY_BADGE_LABELS[variant]}
        </Text>
      </Animated.View>
    </Animated.View>
  );
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

      playBadgeVariant: getPlayBadgeVariant(descriptivePlay),

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
  }, [awayLogo, awayTeamId, homeLogo, homeTeamId, play?.team]);

  if (!playInfo) {
    return null;
  }

  const outLabel = playInfo.outs === 1 ? "OUT" : "OUTS";

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>

      <Animated.View
        style={styles.wrapper}
        layout={reducedMotion ? undefined : FadingTransition.duration(180)}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            {possessionLogo ? (
              <Image
                source={possessionLogo}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            ) : null}

            <Animated.Text
              key={`header-${playInfo.playKey}`}
              entering={reducedMotion ? undefined : FadeInDown.duration(180)}
              exiting={reducedMotion ? undefined : FadeOutUp.duration(140)}
              style={styles.titleText}
              numberOfLines={1}
              selectable
            >
              {playInfo.half ?? ""} {playInfo.inning ?? ""}
              {" • "}
              {playInfo.balls}-{playInfo.strikes}
              {" • "}
              {playInfo.outs ?? 0} {outLabel}
            </Animated.Text>
          </View>

          <View style={styles.headerMeta}>
            {playInfo.playBadgeVariant ? (
              <PlayStatusBadge
                key={`${playInfo.playKey}-${playInfo.playBadgeVariant}`}
                playKey={playInfo.playKey}
                styles={styles}
                variant={playInfo.playBadgeVariant}
              />
            ) : null}
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
            <Text style={styles.detailText} numberOfLines={3} selectable>
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
