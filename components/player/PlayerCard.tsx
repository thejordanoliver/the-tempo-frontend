import { teams } from "constants/teams"; // your teams list
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCard.styles";
export interface PlayerCardProps {
  id: number;
  playerId: number;
  name: string;
  position?: string | null;
  team: string;
  avatarUrl?: string | null;
  jerseyNumber?: string | number | null;
  statNumber?: string | number | null;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  playerId,
  position,
  team,
  avatarUrl,
  jerseyNumber,
  statNumber, // ✅ NEW
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = playerCardStyles(isDark);
  const router = useRouter();

  const cleanTeam = team.replace(/"/g, "");
  const teamObj = teams.find((t) => t.fullName === cleanTeam);

  const initial =
    typeof name === "string" && name.length > 0 ? name[0].toUpperCase() : "?";

  const displayNumber =
    statNumber != null && statNumber !== ""
      ? statNumber // → Use stat number if provided
      : typeof jerseyNumber === "string" && /^\d+$/.test(jerseyNumber)
      ? `#${jerseyNumber}` // → Else use jersey
      : null; // → Else display nothing

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (!teamObj) {
          console.warn(`No team found for "${team}"`);
          return;
        }
        router.push({
          pathname: "/player/[id]",
          params: {
            id: playerId.toString(),
            teamId: teamObj.id.toString(),
          },
        });
      }}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>

        {displayNumber && (
          <Text style={styles.jerseyNumber}>{displayNumber}</Text>
        )}
      </View>
    </Pressable>
  );
};

export default PlayerCard;
