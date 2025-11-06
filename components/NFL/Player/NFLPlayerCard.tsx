// components/NFLPlayerCard.tsx
import { teams } from "constants/teamsNFL";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCard.styles";

export interface NFLPlayerCardProps {
  id: number;
  name: string;

  position?: string | null;
  team: string;
  avatarUrl?: string | null;
  number?: string | number | null;
}

export const NFLPlayerCard: React.FC<NFLPlayerCardProps> = ({
  id,
  name,
  position,
  team,
  avatarUrl,
  number,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = playerCardStyles(isDark);

  const teamObj = teams.find((t) => t.name === team);
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/player/nfl/[id]",
          params: {
            id: id.toString(),
            teamId: teamObj?.id?.toString() ?? "0",
          },
        })
      }
    >
      <View style={styles.nameContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[
              styles.avatar,
              { backgroundColor: isDark ? "#444" : "#ddd" },
            ]}
            accessibilityLabel={`Avatar for ${name}`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text
              style={[styles.name, { color: isDark ? "#fff" : teamObj?.color }]}
            >
              {name}
            </Text>
          </View>

          {number != null && (
            <Text
              style={[
                styles.jerseyNumber,
                { color: isDark ? "#fff" : teamObj?.color },
              ]}
            >
              #{number}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default NFLPlayerCard;
