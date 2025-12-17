// components/TeamPlayerList.tsx
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
} from "react-native";
import { CBBPlayer } from "types/types";
import { style } from "../../../styles/TeamDetailsStyles";
import PlayerCard from "components/Player/PlayerCard";

interface TeamPlayerListProps {
  players: CBBPlayer[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  teamFullName: string;
  teamColor: string;
  isDark: boolean;
}

export default function TeamPlayerList({
  players,
  loading,
  error,
  refreshing,
  onRefresh,
  teamFullName,
  teamColor,
  isDark,
}: TeamPlayerListProps) {
  const styles = style(isDark);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 12,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={teamColor}
        />
      }
    >
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : players.length === 0 ? (
        <Text style={styles.errorText}>No players found.</Text>
      ) : (
        [...players]
          .sort((a, b) => {
            const jerseyA = parseInt(a.jersey ?? "0", 10);
            const jerseyB = parseInt(b.jersey ?? "0", 10);
            return jerseyA - jerseyB;
          })
          .map((player) => (
            <PlayerCard
              key={player.id}
              id={Number(player.id)}
              name={player.name ?? ""}
              position={player.position}
              team={teamFullName}
              avatarUrl={player.imageUrl}
              number={player.jersey}
            />
          ))
      )}
    </ScrollView>
  );
}
