// components/Roster.tsx
import type { Player } from "@/hooks/LeagueHooks/useRoster";
import { rosterStyles } from "@/styles/TeamStyles/RosterStyles";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { FlatList, RefreshControl, Text, View } from "react-native";
import PlayerCardSkeletonList from "../../../Skeletons/PlayerCardListSkeleton";
import { PlayerCard } from "../Player/PlayerCard";

interface RosterProps {
  players: Player[];
  league?: string;
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
  const styles = rosterStyles;

  if (loading) return <PlayerCardSkeletonList count={15} showHeader={false} />;

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

  return (
    <FlatList
      data={players}
      keyExtractor={(player) => String(player.id)}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item: player }) => (
        <PlayerCard
          id={player.id}
          name={player.full_name}
          position={player.position}
          headshot={player.headshot_url}
          number={player.jersey_number}
          teamId={player.team_id}
          league={league}
        />
      )}
      ListEmptyComponent={
        <View style={global.emptyContainer}>
          <Text style={global.emptyTitle}>No players found.</Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
        />
      }
    />
  );
}
