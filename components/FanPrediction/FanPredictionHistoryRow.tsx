import { getNBATeam, getNBATeamLogo } from "@/constants/teams";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getMCBBTeam, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { getMLBTeam, getMLBTeamLogo } from "@/constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "@/constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "@/constants/teamsNHL";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { winnerStyle } from "@/utils/games";
import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { fanPredictionHistoryRowStyles } from "styles/FanPredictionStyles/FanPredictionHistoryRowStyles";
import { gameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import type {
  FanPredictionPick,
  FanPredictionPickTeam,
} from "types/fanPredictions";
import { formatDate, formatTime, safeDate } from "utils/dateUtils";

type Props = { pick: FanPredictionPick; isDark: boolean; onPress: () => void };

function FanPredictionHistoryRow({ pick, isDark, onPress }: Props) {
  const styles = useMemo(() => fanPredictionHistoryRowStyles(isDark), [isDark]);
  const gameStyles = useMemo(() => gameCardStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
  const outcome =
    pick.outcome === "void"
      ? "Not scored"
      : pick.outcome.charAt(0).toUpperCase() + pick.outcome.slice(1);
  const outcomeColor =
    pick.outcome === "correct"
      ? colors.green
      : pick.outcome === "incorrect"
        ? isDark
          ? Colors.dark.lightRed
          : Colors.light.red
        : colors.icon;

  const isScheduled = pick.state === "pre";
  const isLive = pick.state === "in";
  const isFinal = pick.state === "post";

  const scoreText = (participant: FanPredictionPickTeam | undefined) => (
    <Text
      style={
        isScheduled
          ? gameStyles.teamRecord
          : [
              gameStyles.teamScore,
              winnerStyle({
                isDark,
                isWinner: participant?.id === pick.winnerId,
                isTie: !isFinal || !pick.winnerId,
              }),
            ]
      }
    >
      {isScheduled ? (participant?.record ?? "—") : (participant?.score ?? "—")}
    </Text>
  );

  const team = (
    participant: FanPredictionPickTeam | undefined,
    fallback: string,
    league: string,
  ) => {
    const teamCode =
      league === "nfl"
        ? getNFLTeam(participant?.id ?? 0)?.code
        : league === "cfb"
          ? getCFBTeam(participant?.id ?? 0)?.code
          : league === "nba"
            ? getNBATeam(participant?.id ?? 0)?.code
            : league === "mcbb"
              ? getMCBBTeam(participant?.id ?? 0)?.code
              : league === "wcbb"
                ? getWCBBTeam(participant?.id ?? 0)?.code
                : league === "nhl"
                  ? getNHLTeam(participant?.id ?? 0)?.code
                  : league === "mlb"
                    ? getMLBTeam(participant?.id ?? 0)?.code
                    : getSOCCTeam(participant?.id ?? 0)?.code;
    const teamLogo =
      league === "nfl"
        ? getNFLTeamLogo(participant?.id, isDark)
        : league === "cfb"
          ? getCFBTeamLogo(participant?.id, isDark)
          : league === "nba"
            ? getNBATeamLogo(participant?.id, isDark)
            : league === "mcbb"
              ? getMCBBTeamLogo(participant?.id, isDark)
              : league === "mcbb"
                ? getMCBBTeamLogo(participant?.id, isDark)
                : league === "wcbb"
                  ? getWCBBTeamLogo(participant?.id, isDark)
                  : league === "nhl"
                    ? getNHLTeamLogo(participant?.id, isDark)
                    : league === "mlb"
                      ? getMLBTeamLogo(participant?.id, isDark)
                      : getSOCCTeamLogo(participant?.id, isDark);

    return (
      <View style={gameStyles.teamSection}>
        <Image source={teamLogo} style={gameStyles.logo} contentFit="contain" />

        <Text
          style={gameStyles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {teamCode ?? fallback}
        </Text>
        {participant && participant.id === pick.pickedTeamId ? (
          <Text style={styles.picked}>PICKED</Text>
        ) : (
          <View style={styles.pickSpacer} />
        )}
      </View>
    );
  };

  const renderStatus = () => {
    return (
      <View style={styles.info}>
        {isScheduled && pick.statusDescription && (
          <View style={gameStyles.infoWrapper}>
            <Text style={gameStyles.date} numberOfLines={1}>
              {formatDate(safeDate(pick.startsAt))}
            </Text>
            <View style={gameStyles.statusDivider} />
            <Text style={gameStyles.date}>
              {formatTime(safeDate(pick.startsAt))}
            </Text>
          </View>
        )}
        {isLive && pick.statusDescription && (
          <View style={gameStyles.infoWrapper}>
            <Text style={gameStyles.date} numberOfLines={1}>
              {pick.statusDescription}
            </Text>
          </View>
        )}
        {isFinal && pick.statusDescription && (
          <View style={gameStyles.infoWrapper}>
            <Text style={gameStyles.finalText} numberOfLines={1}>
              {pick.statusDescription}
            </Text>
            <View style={gameStyles.finalStatusDivider} />
            <Text style={gameStyles.finalText}>
              {formatDate(safeDate(pick.startsAt))}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pick.matchup}, picked ${pick.pickedName}, ${outcome}`}
      accessibilityHint="Open game details"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && global.pressed]}
    >
      <View style={styles.card}>
        {team(pick.away, "AWAY", pick.league)}
        {scoreText(pick.away)}

        <View style={styles.info}>{renderStatus()}</View>

        {scoreText(pick.home)}
        {team(pick.home, "HOME", pick.league)}
      </View>
      <View style={styles.footer}>
        <Text style={styles.pickSummary} numberOfLines={1}>
          Picked {pick.pickedName}
        </Text>
        <View
          style={[
            styles.outcomeBadge,
            {
              backgroundColor:
                pick.outcome === "correct"
                  ? colors.transparentGreen
                  : pick.outcome === "incorrect"
                    ? isDark
                      ? Colors.dark.transparentLightRed
                      : Colors.light.transparentRed
                    : colors.transparentItemBackground,
            },
          ]}
        >
          <Ionicons
            name={
              pick.outcome === "correct"
                ? "checkmark-circle"
                : pick.outcome === "incorrect"
                  ? "close-circle"
                  : pick.outcome === "pending"
                    ? "time-outline"
                    : "remove-circle-outline"
            }
            size={13}
            color={outcomeColor}
          />
          <Text style={[styles.outcome, { color: outcomeColor }]}>
            {outcome}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.icon} />
      </View>
    </Pressable>
  );
}

export default memo(FanPredictionHistoryRow);
