import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as nflTeams } from "constants/teamsNFL";

import { useRouter } from "expo-router";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCard.styles";

export interface PlayerCardProps {
  id: number;
  name: string;
  position?: string | null;
  team: string;
  avatarUrl?: string | null;
  number?: string | number | null;
  league?: "NFL" | "CFB" | "MLB" | "CBB";
  statNumber?: string | number | null;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  id,
  name,
  position,
  team,
  avatarUrl,
  number,
  statNumber,
  league = "NFL",
}) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = playerCardStyles(isDark);

  const leagueTeamsMap = {
    NFL: nflTeams,
    CFB: cfbTeams,
    MLB: mlbTeams,
    CBB: cbbTeams,
  };

  const teamList = leagueTeamsMap[league];
  const teamObj = teamList.find((t) => t.name === team);

  const initial = name[0]?.toUpperCase() ?? "?";

  const formattedStat =
    statNumber != null ? Number(statNumber).toLocaleString() : null;

  return (
    <Pressable style={styles.card}>
      <View style={styles.nameContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>

          {formattedStat && (
            <Text style={styles.jerseyNumber}>{formattedStat}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default PlayerCard;
