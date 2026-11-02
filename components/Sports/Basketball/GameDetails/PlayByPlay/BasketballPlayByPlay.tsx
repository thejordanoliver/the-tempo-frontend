import HeadingTwo from "components/Headings/HeadingTwo";
import PlayByPlayHeader from "components/Sports/PlayByPlay/PlayByPlayHeader";
import { Colors } from "constants/styles";
import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
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
  isDark: boolean;
  league: string;
  scope?: string;
  neutralSite: boolean;
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
  isDark,
  scope = "",
  neutralSite,
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

  if (state !== "in") return null;

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Play By Play</HeadingTwo>
      <View style={[styles.wrapper, styles.basketballWrapper]}>
        <PlayByPlayHeader
          isDark={isDark}
          title={latest?.type?.text || "Waiting for updates"}
          logo={teamLogo}
          period={latest ? period : null}
          clock={latest ? clock : null}
          isLive={playback.followingLatest && isBasketballPlayLive(state)}
        />
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailText,
              isScoring && styles.scoringPlay,
              isTurnover && styles.turnover,
            ]}
          >
            {latest?.text ||
              latest?.shortDescription ||
              latest?.type?.text ||
              "The latest play will appear when game coverage is available."}
          </Text>
        </View>

        <View style={styles.fieldFrame}>
          <BasketballPlayCourt
            play={latest}
            homeId={homeId}
            awayId={awayId}
            homeLogo={homeLogo}
            homeColor={homeColor ?? Colors.midTone}
            markerColor={markerColor}
            awayColor={awayColor ?? Colors.midTone}
            isDark={isDark}
            active={active}
            eventKey={playback.animationKey}
            neutralSite={neutralSite}
            layout="full"
          />
        </View>

        {Array.isArray(latest?.participants) && latest.participants.length ? (
          <View style={styles.participantsRow}>
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
