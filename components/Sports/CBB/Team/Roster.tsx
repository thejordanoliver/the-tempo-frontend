// components/TeamPlayerList.tsx
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import { globalStyles } from "constants/Styles";
import { RefreshControl, ScrollView, Text, useColorScheme } from "react-native";
import { CBBPlayer } from "types/types";

interface TeamPlayerListProps {
  players: CBBPlayer[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  teamFullName: string | null;
  teamId: string | number | undefined;
  isWomen?: boolean;
}

export default function Roster({
  players,
  loading,
  error,
  refreshing,
  onRefresh,
  teamFullName,
  teamId,
  isWomen,
}: TeamPlayerListProps) {
  const isDark = useColorScheme() === "dark";
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
              name={player.fullName ?? ""}
              position={player.position}
              team={teamFullName}
              teamId={teamId}
              avatarUrl={player.imageUrl}
              number={player.jersey}
              league={isWomen ? "WCBB" : "CBB"}
            />
          ))}
    </ScrollView>
  );
}
