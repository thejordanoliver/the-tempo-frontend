import HeadingTwo from "components/Headings/HeadingTwo";
import { memo, useMemo } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { PlayByPlayStyles } from "styles/GameDetailStyles/PlayByPlayStyles";
import type { SoccerPlayByPlayEvent } from "types/soccer/playByPlay";
import { formatPeriod } from "utils/games/games";
import SoccerPlayField from "./SoccerPlayField";

type Props = {
  events?: SoccerPlayByPlayEvent[];
  awayId: string | number;
  homeId: string | number;
  awayCode: string;
  homeCode: string;
  awayLogo: ImageSourcePropType;
  homeLogo: ImageSourcePropType;
  state?: string | null;
  isDark: boolean;
};

function SoccerPlayByPlay({
  events = [],
  awayId,
  homeId,
  awayLogo,
  homeLogo,
  state,
  isDark,
}: Props) {
  const styles = useMemo(() => PlayByPlayStyles(isDark), [isDark]);
  const latest = events[0];
  const teamId = latest?.team?.id != null ? String(latest.team.id) : null;
  const teamLogo =
    teamId === String(awayId)
      ? awayLogo
      : teamId === String(homeId)
        ? homeLogo
        : latest?.team?.logo
          ? { uri: latest.team.logo }
          : undefined;
  const period = latest?.shootout
    ? "Pens"
    : formatPeriod({ period: latest?.period, isSOCC: true });

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
              {latest?.typeText ??
                (state === "post"
                  ? "Coverage unavailable"
                  : "Waiting for updates")}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            {latest?.scoringPlay ? (
              <View style={[styles.playStatusBadge, styles.scoreBadge]}>
                <Text style={styles.playStatusText}>GOAL</Text>
              </View>
            ) : null}
            {latest ? (
              <View style={styles.liveRow}>
                {state === "in" ? <View style={styles.liveDot} /> : null}
                {period ? <Text style={styles.gameTime}>{period}</Text> : null}
                {period && latest.clock ? (
                  <View style={styles.divider} />
                ) : null}
                {latest.clock ? (
                  <Text style={styles.gameTime}>{latest.clock}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailText,
              latest?.scoringPlay && styles.scoringPlay,
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {latest?.text ??
              (state === "post"
                ? "Play-by-play is unavailable for this match."
                : "The latest play will appear when match coverage is available.")}
          </Text>
        </View>
        <View style={styles.fieldFrame}>
          <SoccerPlayField event={latest} />
        </View>
        {latest?.participants.length ? (
          <View style={styles.participantsRow}>
            {latest.participants.slice(0, 2).map(({ athlete, role }, index) => {
              const name =
                athlete.displayName || athlete.fullName || athlete.shortName;
              const headshot =
                typeof athlete.headshot === "string"
                  ? athlete.headshot
                  : athlete.headshot?.href;
              const initials = name
                ?.split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("");
              return name ? (
                <View
                  key={`${athlete.id ?? name}-${index}`}
                  style={styles.participantItem}
                >
                  <View style={styles.participantAvatar}>
                    {headshot ? (
                      <Image
                        source={{ uri: headshot }}
                        style={styles.participantHeadshot}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.participantInitials}>{initials}</Text>
                    )}
                  </View>
                  <View style={styles.participantTextGroup}>
                    {role ? (
                      <Text style={styles.participantRole} numberOfLines={1}>
                        {role}
                      </Text>
                    ) : null}
                    <Text style={styles.participantName} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                </View>
              ) : null;
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default memo(SoccerPlayByPlay);
