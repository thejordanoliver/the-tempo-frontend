import { NBAPlayoffTeam } from "@/types/basketball";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { Image, Text, View } from "react-native";
import { nbaPlayoffBracketStyles } from "styles/NBAPlayoffBraketStyles";

export const TeamRow = ({
  team,
  wins,
  score,
  oponnentWins,
  isDark,
}: {
  team?: NBAPlayoffTeam;
  wins: number;
  oponnentWins: number;
  score: number | null;
  isDark: boolean;
}) => {
  const styles = nbaPlayoffBracketStyles(isDark);
  const teamId = team?.id;
  const teamLogo = getTeamLogo(teamId, isDark);
  const teamData = teamId != null ? getNBATeam(teamId) : undefined;
  const teamName = teamData?.code || "TBD";
  const seed = team?.playoffSeed ?? team?.seed;
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
        {seed ?? "-"}
      </Text>
      <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />
      <Text
        numberOfLines={1}
        style={[styles.teamCode, { color: getTeamCodeColor() }]}
      >
        {teamName}
      </Text>
      {score != null && (
        <View style={styles.winsBadge}>
          <Text numberOfLines={1} style={styles.score}>
            {score}
          </Text>
        </View>
      )}
      {score == null && (
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
