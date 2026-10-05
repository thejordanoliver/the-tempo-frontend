import { getNFLTeamLogo } from "constants/teamsNFL";
import { Image, Text, View } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import type { PlayoffTeam } from "../../../../../types/football/nflBracketTypes";
import { isTbdTeam } from "../../../../../utils/nflBracketUtils";

export const TeamRow = ({
  team,
  gameCompleted,
  isDark,
}: {
  team?: PlayoffTeam | null;
  gameCompleted: boolean;
  isDark: boolean;
}) => {
  const styles = NFLPlayoffBracketStyles(isDark);

  const isTbd = isTbdTeam(team);

  const isWinner = gameCompleted && !isTbd && team?.winner === true;
  const isLoser = gameCompleted && !isTbd && team?.winner === false;
  const opacity = isLoser ? 0.5 : 1;
  const teamLogo = getNFLTeamLogo(team?.id, isDark);
  const teamCode = isTbd ? "TBD" : team?.code?.trim() || "TBD";
  const seed = isTbd ? "-" : (team?.rank ?? "-");

  /*
   * Future TBD teams use a placeholder score of zero.
   * Only display scores for completed games with real teams.
   */
  const score =
    !isTbd && gameCompleted && team?.score !== null && team?.score !== undefined
      ? team.score
      : null;

  return (
    <View style={styles.teamRow}>
      <Text style={[styles.seedText, { opacity }]}>{seed}</Text>

      {teamLogo && (
        <Image
          source={typeof teamLogo === "string" ? { uri: teamLogo } : teamLogo}
          style={[styles.teamLogo, { opacity }]}
          resizeMode="contain"
        />
      )}
      <Text
        numberOfLines={1}
        style={[
          styles.teamCode,
          {
            opacity: isWinner ? 1 : opacity,
          },
        ]}
      >
        {teamCode}
      </Text>

      {score !== null ? (
        <View style={styles.winsBadge}>
          <Text style={[styles.score, { opacity }]}>{score}</Text>
        </View>
      ) : null}
    </View>
  );
};
