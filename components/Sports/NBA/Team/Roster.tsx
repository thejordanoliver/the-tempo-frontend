// components/Roster.tsx
import { Player } from "@/hooks/LeagueHooks/useRoster";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React from "react";
import { RefreshControl, ScrollView, Text } from "react-native";
import PlayerCardSkeletonList from "../../../Skeletons/PlayerCardListSkeleton";
import { PlayerCard } from "../Player/PlayerCard";

interface RosterProps {
  players: Player[];
  league?: "NBA" | "CBB" | "WCBB" | "WNBA" | "NHL";
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Roster({
  players,
  league,
  loading,
  error,
  refreshing,
  onRefresh,
}: RosterProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const tintColor = isDark ? Colors.white : Colors.black;

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
          tintColor={tintColor}
        />
      }
    >
      {players &&
        [...players].map((player) => {
          return (
            <PlayerCard
              key={player.id}
              id={league === "NBA" ? player.player_id : player.id}
              name={player.full_name}
              position={player.position}
              headshot={player.headshot_url}
              number={player.jersey_number}
              teamId={player.team_id}
              league={league}
            />
          );
        })}
    </ScrollView>
  );
}
