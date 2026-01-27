// components/TeamPlayerList.tsx
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import { globalStyles } from "constants/Styles";
import { RefreshControl, ScrollView, Text } from "react-native";
import { CBBPlayer } from "types/types";

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

export default function Roster({
  players,
  loading,
  error,
  refreshing,
  onRefresh,
  teamFullName,
  teamColor,
  isDark,
}: TeamPlayerListProps) {
  const global = globalStyles(isDark);

  if (loading) return <PlayerCardSkeletonList count={15} showHeader={false} />;
  if (error) return <Text style={global.errorText}>{error}</Text>;
  if (players.length === 0)
    return <Text style={global.emptyText}>No players found.</Text>;

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
      {players &&
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
              league="CBB"
            />
          ))}
    </ScrollView>
  );
}
