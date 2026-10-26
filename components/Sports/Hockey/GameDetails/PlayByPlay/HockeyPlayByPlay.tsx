import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import type { GameStatus, Play } from "hooks/HockeyHooks/useHockeyGameDetails";
import { memo, useMemo, useState } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { PlayByPlayStyles } from "styles/GameDetailStyles/PlayByPlayStyles";
import { formatPeriod } from "utils/games/games";
import {
  isHockeyPlayLive,
  latestHockeyPlay,
} from "utils/sports/hockey/hockeyPlayByPlay";
import HockeyPlayRink from "./HockeyPlayRink";

type Props = {
  plays?: Play[];
  lastPlay?: Play | null;
  awayId: string | number;
  homeId: string | number;
  awayLogo: ImageSourcePropType;
  homeLogo: ImageSourcePropType;
  awayColor?: string;
  homeColor?: string;
  state?: string | null;
  gameStatus?: GameStatus | null;
  isDark: boolean;
};

function ParticipantAvatar({
  headshot,
  initials,
  styles,
}: {
  headshot?: string | null;
  initials: string;
  styles: ReturnType<typeof PlayByPlayStyles>;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={styles.participantAvatar}>
      {headshot && !failed ? (
        <Image
          source={{ uri: headshot }}
          style={styles.participantHeadshot}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={styles.participantInitials}>{initials}</Text>
      )}
    </View>
  );
}

function HockeyPlayByPlay({
  plays,
  lastPlay,
  awayId,
  homeId,
  awayLogo,
  homeLogo,
  awayColor,
  homeColor,
  state,
  gameStatus,
  isDark,
}: Props) {
  const styles = useMemo(() => PlayByPlayStyles(isDark), [isDark]);
  const latest = useMemo(
    () => latestHockeyPlay(plays, lastPlay),
    [plays, lastPlay],
  );
  const teamId = latest?.team?.id != null ? String(latest.team.id) : null;
  const teamLogo =
    teamId === String(awayId)
      ? awayLogo
      : teamId === String(homeId)
        ? homeLogo
        : null;
  const puckColor =
    (teamId === String(awayId)
      ? awayColor
      : teamId === String(homeId)
        ? homeColor
        : undefined) || Colors.light.blue;
  const period = /\b(SO|shootout)\b/i.test(latest?.period?.displayValue ?? "")
    ? "SO"
    : formatPeriod({ period: latest?.period?.number, isNHL: true });
  const clock = latest?.clock?.displayValue;
  const isGoal =
    latest?.scoringPlay === true || /^goal$/i.test(latest?.type?.text ?? "");
  const isPenalty = /penalty/i.test(latest?.type?.text ?? "");

  if (state !== "in" && state !== "post") return null;
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            {teamLogo ? (
              <Image
                source={teamLogo}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            ) : null}
            <Text
              style={styles.titleText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {latest?.type?.text ??
                (state === "post"
                  ? "Coverage unavailable"
                  : "Waiting for updates")}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            {isGoal ? (
              <View style={[styles.playStatusBadge, styles.scoreBadge]}>
                <Text style={styles.playStatusText}>GOAL</Text>
              </View>
            ) : null}
            {latest ? (
              <View style={styles.liveRow}>
                {isHockeyPlayLive(state, gameStatus) ? (
                  <View style={styles.liveDot} />
                ) : null}
                {period ? <Text style={styles.gameTime}>{period}</Text> : null}
                {period && clock ? <View style={styles.divider} /> : null}
                {clock ? <Text style={styles.gameTime}>{clock}</Text> : null}
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailText,
              isGoal && styles.scoringPlay,
              isPenalty && styles.turnover,
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {latest?.text ??
              (state === "post"
                ? "Play-by-play is unavailable for this game."
                : "The latest play will appear when game coverage is available.")}
          </Text>
        </View>
        <View style={styles.fieldFrame}>
          <HockeyPlayRink
            play={latest}
            homeLogo={homeLogo}
            puckColor={puckColor}
          />
        </View>
        {latest?.participants?.length ? (
          <View style={styles.participantsRow}>
            {latest.participants.slice(0, 3).map(({ athlete, type }, index) => {
              const name =
                athlete.displayName ||
                athlete.fullName ||
                athlete.shortName ||
                athlete.name;
              if (!name) return null;
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("");
              return (
                <View
                  key={`${athlete.id ?? name}-${type ?? index}`}
                  style={styles.participantItem}
                >
                  <ParticipantAvatar
                    key={athlete.headshot ?? "initials"}
                    headshot={athlete.headshot}
                    initials={initials}
                    styles={styles}
                  />
                  <View style={styles.participantTextGroup}>
                    {type ? (
                      <Text style={styles.participantRole} numberOfLines={1}>
                        {type.replace(/[-_]/g, " ")}
                      </Text>
                    ) : null}
                    <Text style={styles.participantName} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default memo(HockeyPlayByPlay);
