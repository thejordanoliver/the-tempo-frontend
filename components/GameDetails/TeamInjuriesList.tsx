import players from "constants/players"; // fallback headshot map
import useDbPlayersByTeam, { Player } from "hooks/useDbPlayersByTeam";
import { TeamInjury } from "hooks/useGameDetails";
import { Image, Text, View, useColorScheme } from "react-native";
import { styles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
type Props = {
  injuries: TeamInjury[];
  lighter: boolean;
};

const DEFAULT_HEADSHOT = "https://via.placeholder.com/36?text=👤";

// Map feed team IDs to your database team IDs
const TEAM_ID_MAP: Record<string, string> = {
  "1": "1",
  "2": "2",
  "17": "4",
  "30": "5",
  "4": "6",
  "5": "7",
  "6": "8",
  "7": "9",
  "8": "10",
  "9": "11",
  "10": "14",
  "11": "15",
  "12": "16",
  "13": "17",
  "29": "19",
  "14": "20",
  "15": "21",
  "16": "22",
  "3": "23",
  "18": "24",
  "25": "25",
  "19": "26",
  "20": "27",
  "21": "28",
  "22": "29",
  "23": "30",
  "24": "31",
  "28": "38",
  "26": "40",
  "27": "41",
};

export default function TeamInjuriesList({ injuries, lighter }: Props) {
  const isDark = useColorScheme() === "dark";

  if (!injuries?.length) {
    return null;
  }

  // Extract unique DB team IDs
  const teamIds = injuries.map((t) => {
    const feedId = t.team.id.toString();
    const dbId = TEAM_ID_MAP[feedId] || feedId; // fallback if no mapping
    return dbId;
  });

  // Fetch players for each team using the hook at top level
  const teamPlayersMap: Record<string, Player[]> = {};
  teamIds.forEach((teamId) => {
    const { players } = useDbPlayersByTeam(teamId);

    teamPlayersMap[teamId] = players;
  });

  const getStyles = styles(isDark, lighter);

  return (
    <View style={getStyles.container}>
      {injuries.map((team) => {
        const feedTeamId = team.team.id.toString();
        const dbTeamId = TEAM_ID_MAP[feedTeamId] || feedTeamId;
        const teamPlayers = teamPlayersMap[dbTeamId] || [];

        return (
          <View key={team.team.id} style={getStyles.teamBlock}>
            {team.injuries.map((inj, idx) => {
              const fullName = inj.athlete.fullName;

              // Match player by full_name from DB
              const dbPlayer = teamPlayers.find((p) => {
                if (!p.full_name) return false;
                const dbName = p.full_name.toLowerCase().trim();
                const injName = fullName.toLowerCase().trim();
                const matched =
                  dbName.includes(injName) || injName.includes(dbName);

                return matched;
              });

              // Fallback to headshot map using full name
              const avatarUrl =
                dbPlayer?.avatarUrl || players[fullName] || DEFAULT_HEADSHOT;

              return (
                <View
                  key={idx}
                  style={[
                    getStyles.injuryItem,
                    {
                      borderBottomWidth:
                        idx === team.injuries.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <View style={getStyles.avatarWrapper}>
                    <Image
                      source={{ uri: avatarUrl }}
                      style={getStyles.avatar}
                    />
                  </View>
                  <View style={getStyles.infoSection}>
                    <View style={getStyles.playerHeader}>
                      <Text style={[getStyles.name]}>{fullName}</Text>
                      <Text style={[getStyles.jersey]}>
                        {dbPlayer?.position ?? "—"}{" "}
                        {dbPlayer?.jersey_number
                          ? `#${dbPlayer.jersey_number}`
                          : "N/A"}
                      </Text>
                    </View>
                    <Text style={[getStyles.status]}>{inj.status}</Text>
                    {inj.details?.detail && (
                      <Text style={getStyles.details}>
                        {inj.details.detail}
                      </Text>
                    )}
                  </View>
                  <View>
                    {inj.details?.returnDate && (
                      <Text style={[getStyles.status]}>
                        Return:{" "}
                        {new Date(inj.details.returnDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
