// components/TeamPlayerList.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import { globalStyles } from "constants/styles";
import { TeamPlayer, useTeamRosters } from "hooks/NFLHooks/useTeamRosters";
import { RefreshControl, ScrollView, Text, View } from "react-native";
interface TeamPlayerListProps {
  teamId: number; // 👈 pass teamId instead
  teamFullName: string;
  teamColor: string;
  isDark: boolean;
}

export default function Roster({
  teamId,
  teamFullName,
  teamColor,
  isDark,
}: TeamPlayerListProps) {
  const global = globalStyles(isDark);

  // ✅ Fetch players from hook
  const { players, loading, error, refreshing, refetch } = useTeamRosters(
    teamId,
    "MLB",
  );

  // -------------------------
  // Group players by position
  // -------------------------
  const positionGroups: Record<string, TeamPlayer[]> = {
    Pitchers: [],
    Catchers: [],
    Infielders: [],
    Outfielders: [],
    "Designated Hitters": [],
    "Two-Way Players": [],
    Other: [],
  };

  players.forEach((p) => {
    const pos = (p.position ?? "").toUpperCase();

    if (["P", "RP", "SP"].includes(pos)) {
      positionGroups.Pitchers.push(p);
    } else if (pos === "C") {
      positionGroups.Catchers.push(p);
    } else if (["1B", "2B", "3B", "SS"].includes(pos)) {
      positionGroups.Infielders.push(p);
    } else if (["LF", "CF", "RF", "OF"].includes(pos)) {
      positionGroups.Outfielders.push(p);
    } else if (pos === "DH") {
      positionGroups["Designated Hitters"].push(p);
    } else if (pos === "TWP") {
      positionGroups["Two-Way Players"].push(p);
    } else {
      positionGroups.Other.push(p);
    }
  });

  const sortByJersey = (list: TeamPlayer[]) =>
    [...list].sort(
      (a, b) => Number(a.jersey_number ?? 0) - Number(b.jersey_number ?? 0),
    );

  // -------------------------
  // Loading / Error States
  // -------------------------

  if (loading) return <PlayerCardSkeletonList count={15} showHeader={false} />;
  if (error) return <Text style={global.errorText}>{error}</Text>;
  if (players.length === 0)
    return <Text style={global.emptyText}>No players found.</Text>;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 12,
        gap: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          tintColor={teamColor}
        />
      }
    >
      {Object.entries(positionGroups).map(([groupName, groupPlayers]) => {
        if (groupPlayers.length === 0) return null;

        return (
          <View key={groupName}>
            <HeadingTwo isDark={isDark}>{groupName}</HeadingTwo>

            {sortByJersey(groupPlayers).map((player) => (
              <View key={player.id} style={{ marginBottom: 12 }}>
                <PlayerCard
                  id={Number(player.id)}
                  name={player.name ?? ""}
                  position={player.position}
                  team={teamFullName}
                  avatarUrl={player.avatarUrl}
                  number={player.jersey_number}
                  teamId={player.team_id}
                  league="MLB"
                />
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
