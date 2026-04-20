// components/Roster.tsx
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Player } from "hooks/NBAHooks/usePlayersByTeam";
import React from "react";
import { RefreshControl, ScrollView, Text } from "react-native";
import PlayerCardSkeletonList from "../../../Skeletons/PlayerCardListSkeleton";
import PlayerCard from "../Player/PlayerCard";
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
