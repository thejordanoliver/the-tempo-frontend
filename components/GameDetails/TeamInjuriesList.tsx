import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import players from "constants/players"; // fallback headshot map
import useDbPlayersByTeam, { Player } from "hooks/usePlayersByTeam";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import { TeamInjury } from "./TeamInjuries"; // import your type
type Props = {
  injuries: TeamInjury[];
  lighter: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

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

  if (!injuries?.length) return null;

  const teamIds = injuries.map((t) => {
    const feedId = t.team.id.toString();
    const dbId = TEAM_ID_MAP[feedId] || feedId;
    return dbId;
  });

  const teamPlayersMap: Record<string, Player[]> = {};
  teamIds.forEach((teamId) => {
    const { players } = useDbPlayersByTeam(teamId);
    teamPlayersMap[teamId] = players;
  });

  const styles = teamInjuryStyles(isDark, lighter);

  return (
    <View style={styles.container}>
      {injuries.map((team: TeamInjury) => {
        const feedTeamId = team.team.id.toString();
        const dbTeamId = TEAM_ID_MAP[feedTeamId] || feedTeamId;
        const teamPlayers = teamPlayersMap[dbTeamId] || [];

        return (
          <View key={team.team.id}>
            {team.injuries.map(
              (inj: TeamInjury["injuries"][number], idx: number) => {
                const fullName = inj.athlete.fullName;
                const dbPlayer = teamPlayers.find((p) => {
                  if (!p.full_name) return false;
                  const dbName = p.full_name.toLowerCase().trim();
                  const injName = fullName.toLowerCase().trim();
                  return dbName.includes(injName) || injName.includes(dbName);
                });

                const avatarUrl =
                  dbPlayer?.avatarUrl || players[fullName] || DEFAULT_HEADSHOT;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.injuryItem,
                      {
                        borderBottomWidth:
                          idx === team.injuries.length - 1
                            ? 0
                            : StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                      />
                    </View>
                    <View style={styles.infoSection}>
                      <View style={styles.playerHeader}>
                        <Text style={styles.name}>{fullName}</Text>
                        <Text style={styles.jersey}>
                          {dbPlayer?.position ?? "—"}{" "}
                          {dbPlayer?.jersey_number
                            ? `#${dbPlayer.jersey_number}`
                            : "N/A"}
                        </Text>
                      </View>
                      <Text style={styles.status}>{inj.status}</Text>
                      {inj.details?.detail && (
                        <Text style={styles.details}>{inj.details.detail}</Text>
                      )}
                    </View>
                    <View>
                      {inj.details?.returnDate && (
                        <Text style={styles.status}>
                          Return:{" "}
                          {new Date(
                            inj.details.returnDate
                          ).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
            )}
          </View>
        );
      })}
    </View>
  );
}
