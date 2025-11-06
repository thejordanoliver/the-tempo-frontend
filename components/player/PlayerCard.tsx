import { Fonts } from "constants/fonts";
import { teams } from "constants/teams"; // your teams list
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCard.styles";
export interface PlayerCardProps {
  id: number;
  playerId: number;
  name: string;
  position?: string | null;
  team: string;
  avatarUrl?: string | null;
  jerseyNumber?: string | number | null;
}


const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  playerId,
  position,
  team,
  avatarUrl,
  jerseyNumber,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = playerCardStyles(isDark);
  const router = useRouter();

  const cleanTeam = team.replace(/"/g, "");
  const teamObj = teams.find((t) => t.fullName === cleanTeam);

  const initial =
    typeof name === "string" && name.length > 0 ? name[0].toUpperCase() : "?";

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
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { backgroundColor: isDark ? "#444" : "#ddd" }]}
          accessibilityLabel={`Avatar for ${name}`}
        />
      ) : (
        <View
          style={styles.avatarPlaceholder}
          accessibilityLabel={`Initial placeholder for ${name}`}
        >
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.nameContainer}>
          <Text
            style={[
              styles.name,
              {
                color: isDark ? "#fff" : teamObj?.color,
              },
            ]}
          >
            {name}
          </Text>
        </View>
        {typeof jerseyNumber === "string" && /^\d+$/.test(jerseyNumber) && (
          <Text
            style={[
              styles.jerseyNumber,
              {
                color: isDark ? "#fff" : teamObj?.color,
              },
            ]}
          >
            #{jerseyNumber}
          </Text>
        )}
      </View>
    </Pressable>
  );
};


export default PlayerCard;
