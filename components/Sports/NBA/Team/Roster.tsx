// components/Roster.tsx
import { globalStyles } from "constants/Styles";
import { Player } from "hooks/NBAHooks/usePlayersByTeam";
import React from "react";
import { RefreshControl, ScrollView, Text, useColorScheme } from "react-native";
import PlayerCard from "../Player/PlayerCard";
import PlayerCardSkeletonList from "../Player/PlayerCardListSkeleton";
interface RosterProps {
  players: Player[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  teamFullName: string;
  teamColor: string;
}

export default function Roster({
  players,
  loading,
  error,
  refreshing,
  onRefresh,
  teamFullName,
  teamColor,
}: RosterProps) {
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={teamColor}
        />
      }
    >
      {players &&
        [...players]
          .filter((player) => player.active !== false) // Only show active players
          .sort((a, b) => {
            const jerseyA = parseInt(a.jersey_number ?? "0", 10);
            const jerseyB = parseInt(b.jersey_number ?? "0", 10);
            return jerseyA - jerseyB;
          })
          .map((player) => (
            <PlayerCard
              key={player.id}
              id={player.player_id}
              name={player.full_name}
              position={player.position}
              team={teamFullName}
              avatarUrl={player.avatarUrl}
              number={player.jersey_number}
              teamId={player.team_id}
            />
          ))}
    </ScrollView>
  );
}
