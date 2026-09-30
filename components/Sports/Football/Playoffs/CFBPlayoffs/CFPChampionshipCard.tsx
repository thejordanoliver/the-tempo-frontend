import CFPLogoLight from "@/assets/College_Logos/Conference_Logos/CFPLight.png";
import CFPLogo from "@/assets/College_Logos/Conference_Logos/CFPLogo.png";
import { Colors } from "@/constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import type { FootballGame } from "@/types/football/football";
import { formatDate, formatTime, safeDate } from "@/utils/dateUtils";
import { formatPeriod, getBroadcastDisplay } from "@/utils/games";
import { Image, Pressable, Text, View } from "react-native";
import {
  CFPBracketStyles,
  CHAMPIONSHIP_X,
  CHAMPIONSHIP_Y,
} from "styles/PlayoffStyles/CFPBracketStyles";
import { CFPTeamLogo } from "./CFPTeamLogo";
import { TeamRow } from "./TeamRow";

export function CFPChampionshipCard({
  game,
  onPress,
  isDark,
}: {
  game: FootballGame | null;
  onPress?: () => void;
  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  const cfpLogo = isDark ? CFPLogoLight : CFPLogo;

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const home = getCFBTeam(homeId);
  const away = getCFBTeam(awayId);

  const homeName = home?.code ?? game?.home.name ?? "TBD";
  const awayName = away?.code ?? game?.away.name ?? "TBD";

  const homeLogo = getCFBTeamLogo(homeId, isDark);
  const awayLogo = getCFBTeamLogo(awayId, isDark);

  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const gameStatusDescription = game?.status.description ?? "";
  const gameStatusDetail = game?.status.shortDetail ?? "";
  const state = game?.status.state ?? "pre";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const clock = game?.status?.displayClock;
  const isSuspended = gameStatusDescription === "Suspended";
  const isOT = gameStatusDetail.includes("OT");
  const period = formatPeriod({ period: game?.status.period });
  const redzone = game?.situation.isRedZone;
  const isRedzone = redzone;
  const broadcasts = game?.broadcasts;
  const broadcast = !isFinal && getBroadcastDisplay(broadcasts);
  const downDistanceText = game?.situation.downDistanceText;
  const possessionTeamId = game?.situation.possession;
  const homeHasPossession = inProgress && possessionTeamId === home?.espnId;
  const awayHasPossession = inProgress && possessionTeamId === away?.espnId;
  const homeRecord = game?.home.record ?? "0-0";
  const awayRecord = game?.away.record ?? "0-0";
  const homeScore = game?.home.score ?? 0;
  const awayScore = game?.away.score ?? 0;
  const homeRank = game?.home.rank ?? null;
  const awayRank = game?.away.rank ?? null;
  const homeWins = game?.home.winner ?? false;
  const awayWins = game?.away.winner ?? false;
  const winner = homeWins ? game?.home : awayWins ? game?.away : null;

  const renderDownAndDistance = () => {
    if (!downDistanceText) return null;
    const [beforeAt, afterAt] = downDistanceText.split(" at ");
    return (
      <Text style={styles.downDistance}>
        {beforeAt}
        {afterAt && (
          <>
            {" at "}
            <Text
              style={[
                styles.downDistance,
                isRedzone && {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              {afterAt}
            </Text>
          </>
        )}
      </Text>
    );
  };

  const renderStatus = () => {
    if (inProgress) {
      return (
        <>
          <>
            {!isOT && (
              <>
                <View style={styles.infoWrapper}>
                  <Text style={styles.date}>{period}</Text>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{clock}</Text>
                </View>
              </>
            )}

            {isOT && <Text style={styles.clock}>{period}</Text>}
          </>
          {renderDownAndDistance()}
        </>
      );
    }

    if (endOfPeriod) {
      return <Text style={styles.clock}>End of {period}</Text>;
    }

    if (
      isHalftime ||
      isDelayed ||
      isCanceled ||
      isPostponed ||
      isForfeited ||
      isSuspended
    ) {
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;
    }

    if (isFinal) {
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );
    }

    return (
      <View style={styles.infoWrapper}>
        <Text style={styles.date}>{formattedDate}</Text>

        <View style={styles.statusDivider} />

        <Text style={styles.date}>{tbd || formattedTime}</Text>
      </View>
    );
  };

  return (
    <Pressable
      disabled={!game || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.championshipCard,

        {
          left: CHAMPIONSHIP_X,
          top: CHAMPIONSHIP_Y,
        },

        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.cfpLogo}>
        <Image source={cfpLogo} style={styles.cfpLogo} resizeMode="contain" />
      </View>

      <Text style={styles.championshipLabel}>NATIONAL CHAMPIONSHIP</Text>
      <View style={styles.championshipDivider} />

      {winner ? (
        <View style={styles.championTeam}>
          <CFPTeamLogo
            team={winner}
            isDark={isDark}
            style={styles.championLogo}
          />

          <View>
            <Text numberOfLines={1} style={styles.championName}>
              {winner.name}
            </Text>

            <Text style={styles.championSubtext}>NATIONAL CHAMPION</Text>
          </View>
        </View>
      ) : (
        <View style={styles.championshipTeams}>
          <TeamRow
            id={homeId}
            logo={awayLogo}
            name={awayName}
            rank={awayRank}
            winner={awayWins}
            score={awayScore}
            record={awayRecord}
            possession={awayHasPossession}
            state={state}
            isDark={isDark}
          />

          <View style={styles.divider} />

          <TeamRow
            id={homeId}
            logo={homeLogo}
            name={homeName}
            rank={homeRank}
            winner={homeWins}
            score={homeScore}
            record={homeRecord}
            possession={homeHasPossession}
            state={state}
            isDark={isDark}
          />
          <View style={styles.statusContainer}>
            {renderStatus()}
            <Text style={styles.broadcast}>{broadcast}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
