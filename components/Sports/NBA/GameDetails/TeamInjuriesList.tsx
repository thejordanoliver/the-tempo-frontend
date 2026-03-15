// TeamInjuriesList.tsx
import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import { TeamInjury } from "./TeamInjuries";
import { Player } from "hooks/NBAHooks/usePlayersByTeam";

type Props = {
  injuries: TeamInjury[];
  teamPlayersMap: Record<string, Player[]>;
  lighter: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

export default function TeamInjuriesList({
  injuries,
  teamPlayersMap,
  lighter,
}: Props) {
  const isDark = useColorScheme() === "dark";
  if (!injuries?.length) return null;

  const styles = teamInjuryStyles(isDark, lighter);

  return (
    <View style={styles.container}>
      {injuries.map((team: TeamInjury) => {
        const teamId = String(team.team.id);
        const teamPlayers = teamPlayersMap[teamId] || [];

        return (
          <View key={teamId}>
            {team.injuries.map((inj, idx) => {
              const espnId = inj.athlete.id; // ESPN ID from injury feed

              // Find matching DB player by espn_id
              const dbPlayer = teamPlayers.find((p) => p.espn_id === Number(espnId));

              const avatarUrl = dbPlayer?.avatarUrl || DEFAULT_HEADSHOT;
              const playerName = dbPlayer?.short_name || inj.athlete.fullName;
              const jersey = dbPlayer?.jersey_number || "N/A";
              const position = dbPlayer?.position || "—";

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
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.playerHeader}>
                      <Text style={styles.name}>{playerName}</Text>
                      <Text style={styles.jersey}>
                        {position} #{jersey}
                      </Text>
                    </View>

                    {inj.details?.detail && (
                      <Text style={styles.details}>{inj.details.detail}</Text>
                    )}

                    <Text style={styles.status}>{inj.status}</Text>
                  </View>

                  {inj.details?.returnDate && (
                    <View>
                      <Text style={styles.status}>
                        Return: {new Date(inj.details.returnDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}