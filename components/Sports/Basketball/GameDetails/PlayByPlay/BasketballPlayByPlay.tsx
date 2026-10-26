import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/styles";
import type {
  GameStatus,
  Play,
} from "hooks/BasketballHooks/useBasketballGameDetails";
import { useBasketballPlayback } from "hooks/BasketballHooks/useBasketballPlayback";
import { useScreenActivity } from "hooks/useScreenActivity";
import { memo, useMemo, useState } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { PlayByPlayStyles } from "styles/GameDetailStyles/PlayByPlayStyles";
import { basketballPeriodLabel } from "utils/sports/basketball/basketballEvents";
import { isBasketballPlayLive } from "utils/sports/basketball/basketballPlayByPlay";
import BasketballPlayCourt from "./BasketballPlayCourt";

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
  league: string;
  scope?: string;
  homeCode?: string;
  awayCode?: string;
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

function BasketballPlayByPlay({
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
  league,
  scope = "",
  homeCode = "Home",
  awayCode = "Away",
}: Props) {
  const styles = useMemo(() => PlayByPlayStyles(isDark), [isDark]);
  const playback = useBasketballPlayback(plays, lastPlay, scope);
  const latest = playback.play;
  const { active } = useScreenActivity();
  const teamId = latest?.team?.id != null ? String(latest.team.id) : null;
  const teamLogo =
    teamId === String(awayId)
      ? awayLogo
      : teamId === String(homeId)
        ? homeLogo
        : null;
  const markerColor =
    (teamId === String(awayId)
      ? awayColor
      : teamId === String(homeId)
        ? homeColor
        : undefined) || Colors.light.blue;
  const period = latest?.period?.number
    ? basketballPeriodLabel(Number(latest.period.number))
    : "";
  const clock = latest?.clock?.displayValue;
  const isScoring =
    latest?.scoringPlay === true && (latest?.scoreValue ?? 0) > 0;
  const isTurnover = /turnover/i.test(latest?.type?.text ?? "");

  if (league.toLowerCase() !== "nba") return null;
  if (state !== "in" && state !== "post") return null;
  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>
      <View style={[styles.wrapper, styles.basketballWrapper]}>
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
              {latest?.shortDescription ||
                latest?.type?.text ||
                (state === "post"
                  ? "Coverage unavailable"
                  : "Waiting for updates")}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            {isScoring ? (
              <View style={[styles.playStatusBadge, styles.scoreBadge]}>
                <Text style={styles.playStatusText}>
                  +{latest?.scoreValue} PTS
                </Text>
              </View>
            ) : null}
            {latest ? (
              <View style={styles.liveRow}>
                {playback.followingLatest &&
                isBasketballPlayLive(state, gameStatus) ? (
                  <View style={styles.liveDot} />
                ) : null}
                {period ? <Text style={styles.gameTime}>{period}</Text> : null}
                {period && clock ? <View style={styles.divider} /> : null}
                {clock ? <Text style={styles.gameTime}>{clock}</Text> : null}
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.detailRow, styles.basketballDetailRow]}>
          <Text
            style={[
              styles.detailText,
              isScoring && styles.scoringPlay,
              isTurnover && styles.turnover,
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {latest?.text ||
              latest?.shortDescription ||
              latest?.type?.text ||
              (state === "post"
                ? "Play-by-play is unavailable for this game."
                : "The latest play will appear when game coverage is available.")}
          </Text>
        </View>

        <View style={styles.fieldFrame}>
          <BasketballPlayCourt
            play={latest}
            homeId={homeId}
            awayId={awayId}
            homeLogo={homeLogo}
            homeColor={homeColor || Colors.midTone}
            markerColor={markerColor}
            awayColor={awayColor}
            isDark={isDark}
            active={active}
            eventKey={playback.animationKey}
            layout="full"
          />
        </View>
        {Array.isArray(latest?.participants) && latest.participants.length ? (
          <View
            style={[styles.participantsRow, styles.basketballParticipantsRow]}
          >
            {latest.participants
              .filter((participant) => participant?.athlete)
              .slice(0, 3)
              .map(({ athlete, type }, index) => {
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

export default memo(BasketballPlayByPlay);
