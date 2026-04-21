// components/TeamPlayerList.tsx
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { RefreshControl, ScrollView, Text } from "react-native";
import { BasketballPlayer } from "types/basketball";

interface TeamPlayerListProps {
  players: BasketballPlayer[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  teamFullName: string | null;
  teamId: string | number | undefined;
  isWomen?: boolean;
  isWNBA?: boolean;
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
  isWNBA,
}: TeamPlayerListProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
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
            const jerseyA = parseInt(a.jersey_number ?? "0", 10);
            const jerseyB = parseInt(b.jersey_number ?? "0", 10);
            return jerseyA - jerseyB;
          })
          .map((player) => (
            <PlayerCard
              key={player.id}
              id={Number(player.id)}
              name={player.name ?? ""}
              position={player.position}
              team={teamFullName}
              teamId={teamId}
              avatarUrl={player.headshot_url}
              number={player.jersey_number}
              league={isWNBA ? "WNBA" : isWomen ? "WCBB" : "CBB"}
            />
          ))}
    </ScrollView>
  );
}
