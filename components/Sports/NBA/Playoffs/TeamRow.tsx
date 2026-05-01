import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { Image, Text, View } from "react-native";
import { nbaPlayoffBracketStyles } from "styles/NBAPlayoffBraketStyles";
import { PlayoffTeam } from "types/nba";

export const TeamRow = ({
  team,
  wins,
  score,
  oponnentWins,
  isDark,
}: {
  team?: PlayoffTeam;
  wins: number;
  oponnentWins: number;
  score: number | null;
  isDark: boolean;
}) => {
  const styles = nbaPlayoffBracketStyles(isDark);
  const teamId = team?.id ?? 0;
  const teamLogo = getTeamLogo(teamId, isDark);
  const teamData = getNBATeam(teamId);
  const teamName = teamData?.code ?? "TBD";
  const getTeamCodeColor = () => {
    if (!team) return Colors.midTone;

    if (wins === 4) return isDark ? Colors.white : Colors.black;
    if (oponnentWins === 4) return Colors.midTone;

    return isDark ? Colors.white : Colors.black;
  };

  return (
    <View style={styles.teamRow}>
      <Text
        style={[
          styles.seedText,
          {
            color: team
              ? isDark
                ? Colors.white
                : Colors.black
              : Colors.midTone,
          },
        ]}
      >
        {team?.seed ?? "-"}
      </Text>
      <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />
      <Text
        numberOfLines={1}
        style={[styles.teamCode, { color: getTeamCodeColor() }]}
      >
        {teamName}
      </Text>
      {score && (
        <View style={styles.winsBadge}>
          <Text numberOfLines={1} style={styles.score}>
            {score}
          </Text>
        </View>
      )}
      {!score && (
        <View
          style={[
            styles.winsBadge,
            {
              backgroundColor:
                wins === 4
                  ? Colors.light.gold
                  : isDark
                    ? Colors.transparentDarkGray
                    : Colors.transparentLightGray,
            },
          ]}
        >
          <Text
            style={[
              styles.winsText,
              {
                color:
                  wins === 4
                    ? Colors.black
                    : isDark
                      ? Colors.white
                      : Colors.black,
              },
            ]}
          >
            {team ? wins : "-"}
          </Text>
        </View>
      )}
    </View>
  );
};
