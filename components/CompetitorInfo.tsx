import FootballLight from "assets/icons8/FootballLight.png";
import { Image, Text, View } from "react-native";
import { TeamInfoStyle } from "styles/ModalsStyles/GamePreviewStyles/TeamInfoStyles";
import { CFBTeam } from "types/cfb";
import { MLBTeam } from "types/mlb";
import { MMAFighter } from "types/mma";
import { NFLTeam } from "types/nfl";
import { CBBTeam, NHLTeam, Team } from "types/types";

type CompetitorTeam = Team | CFBTeam | CBBTeam | NFLTeam | NHLTeam | MLBTeam;

type CompetitorInfoProps = {
  name: string;
  logo?: any | string;
  side: "home" | "away";
  gameStatusDescription: string;
  record?: string;
  score?: number;
  opponentScore?: number;
  fighter?: MMAFighter;
  headshot?: string;
  isWinner?: boolean;
  team?: CompetitorTeam;
  rank?: number;
  timeouts?: number;
  bonusState?: string | null;
  possessionTeamId?: number | null;
  isFootball?: boolean;
};

export default function CompetitorInfo({
  name,
  logo,
  side,
  gameStatusDescription,
  record,
  score,
  opponentScore,
  fighter,
  headshot,
  isWinner,
  team,
  rank,
  timeouts,
  bonusState,
  possessionTeamId,
  isFootball,
}: CompetitorInfoProps) {
  const styles = TeamInfoStyle;

  /* -------------------- */
  /* GAME STATUS */
  /* -------------------- */

  const isFinal = ["Final", "Finished"].includes(gameStatusDescription);
  const isScheduled = ["Scheduled", "Not Started"].includes(gameStatusDescription);
  const isInactiveGame = ["Delayed", "Postponed", "Canceled"].includes(gameStatusDescription);
  const isRecordDisplay = isScheduled || isInactiveGame;

  /* -------------------- */
  /* WINNER LOGIC */
  /* -------------------- */

  const finalWinner =
    score !== undefined && opponentScore !== undefined
      ? score > opponentScore
      : isWinner;

  const scoreOpacity = isFinal ? (finalWinner ? 1 : 0.4) : 1;

  /* -------------------- */
  /* DISPLAY VALUE */
  /* -------------------- */

  let displayValue: string | number = "-";
  let valueFontSize = 36;

  if (fighter) {
    displayValue = record ?? "-";
    valueFontSize = 22;
  } else if (isRecordDisplay) {
    displayValue = record ?? "-";
    valueFontSize = 22;
  } else {
    displayValue = score ?? "-";
    valueFontSize = 36;
  }

  /* -------------------- */
  /* POSSESSION */
  /* -------------------- */

  const hasPossession =
    isFootball &&
    possessionTeamId &&
    team &&
    String(possessionTeamId) === String(team?.espnID);

  /* -------------------- */
  /* BONUS */
  /* -------------------- */

  const isBonus = bonusState === "DOUBLE";

  /* -------------------- */
  /* LOGO SOURCE */
  /* -------------------- */

  let logoSource: any = null;

  if (logo) {
    logoSource = typeof logo === "string" ? { uri: logo } : logo;
  } else if (fighter && headshot) {
    logoSource = { uri: headshot };
  }

  /* -------------------- */
  /* TIMEOUT LIMIT BY SPORT */
  /* -------------------- */

  const getMaxTimeouts = () => {
    if (!team) return 0;

    if ("abbreviation" in team) {
      if (isFootball) return 3;
    }

    if ("shortDisplayName" in team) {
      return 1;
    }

    if ("color" in team) {
      return 7;
    }

    return 0;
  };

  const maxTimeouts = getMaxTimeouts();

  /* -------------------- */
  /* TIMEOUT RENDER */
  /* -------------------- */

  const renderTimeouts = (remaining: number = 0) => (
    <View style={styles.timeoutsWrapper}>
      {Array.from({ length: maxTimeouts }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.timeoutBar,
            { opacity: i < remaining ? 1 : 0.3 },
          ]}
        />
      ))}
    </View>
  );

  /* -------------------- */
  /* COMPONENT */
  /* -------------------- */

  return (
    <View
      style={[
        styles.container,
        { justifyContent: side === "home" ? "flex-end" : "flex-start" },
      ]}
    >
      {/* HOME SCORE */}
      {side === "home" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              { opacity: scoreOpacity, fontSize: valueFontSize },
            ]}
          >
            {displayValue}
          </Text>

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}

          {isBonus && <Text style={styles.bonus}>BONUS</Text>}
        </View>
      )}

      {/* TEAM / FIGHTER */}
      <View style={[styles.teamContainer, styles.fighterContainer]}>
        {logoSource &&
          (fighter ? (
            <View style={styles.fighterImageContainer}>
              <Image source={logoSource} style={styles.fighter} />
            </View>
          ) : (
            <Image source={logoSource} style={styles.teamLogo} />
          ))}

        <Text style={fighter ? styles.fighterName : styles.teamName}>
          {rank != null ? `${rank} ` : ""}
          {name ?? ""}
        </Text>

        {isFinal && record && !fighter && (
          <Text style={styles.teamRecord}>{record}</Text>
        )}

        {!fighter &&
          !isRecordDisplay &&
          timeouts !== undefined &&
          maxTimeouts > 0 &&
          renderTimeouts(timeouts)}
      </View>

      {/* AWAY SCORE */}
      {side === "away" && (
        <View style={styles.scoreWrapper}>
          <Text
            style={[
              styles.teamValue,
              { opacity: scoreOpacity, fontSize: valueFontSize },
            ]}
          >
            {displayValue}
          </Text>

          {hasPossession && (
            <Image source={FootballLight} style={styles.possessionIcon} />
          )}

          {isBonus && <Text style={styles.bonus}>BONUS</Text>}
        </View>
      )}
    </View>
  );
}