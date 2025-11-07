// components/NFLPlayerCard.tsx
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as nflTeams } from "constants/teamsNFL";
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
  league?: "NFL" | "CFB";
}

export const PlayerCard: React.FC<NFLPlayerCardProps> = ({
  id,
  name,
  position,
  team,
  avatarUrl,
  number,
  league = "NFL",
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = playerCardStyles(isDark);

  // Pick team set based on league
  const teamList = league === "CFB" ? cfbTeams : nflTeams;
  const teamObj = teamList.find((t) => t.name === team);

  const initial = name?.[0]?.toUpperCase() ?? "?";

  const handlePress = () => {
    const routeBase =
      league === "CFB" ? "/player/cfb/[id]" : "/player/nfl/[id]";
    router.push({
      pathname: routeBase,
      params: {
        id: id.toString(),
        teamId: teamObj?.id?.toString() ?? "0",
      },
    });
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.nameContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
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

export default PlayerCard;
