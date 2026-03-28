// components/TeamPlayerList.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import { globalStyles } from "constants/Styles";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { NHLPlayer } from "types/nhl";

interface RosterProps {
  players: NHLPlayer[];
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
}: RosterProps) {
  const global = globalStyles(isDark);

  // -------------------------
  // Position abbreviation → Full name
  // -------------------------
  const positionNameMap: Record<string, string> = {
    C: "Center",
    LW: "Left Wing",
    RW: "Right Wing",
    D: "Defenseman",
    LD: "Left Defenseman",
    RD: "Right Defenseman",
    G: "Goalie",
  };

  // -------------------------
  // Group players by position
  // -------------------------
  const positionGroups: Record<string, NHLPlayer[]> = {};

  players.forEach((player) => {
    const pos = (player.position ?? "Other").toUpperCase();

    if (!positionGroups[pos]) {
      positionGroups[pos] = [];
    }

    positionGroups[pos].push(player);
  });

  const sortByJersey = (list: NHLPlayer[]) =>
    [...list].sort(
      (a, b) => parseInt(a.jersey ?? "0", 10) - parseInt(b.jersey ?? "0", 10),
    );

  // Logical NHL order
  const positionOrder = ["C", "LW", "RW", "D", "LD", "RD", "G"];

  const sortedPositions = Object.keys(positionGroups).sort((a, b) => {
    const indexA = positionOrder.indexOf(a);
    const indexB = positionOrder.indexOf(b);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

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
          onRefresh={onRefresh}
          tintColor={teamColor}
        />
      }
    >
      {sortedPositions.map((position) => {
        const groupPlayers = positionGroups[position];

        const fullPositionName = positionNameMap[position] ?? position;

        return (
          <View key={position}>
            <HeadingTwo isDark={isDark}>{fullPositionName}</HeadingTwo>

            {sortByJersey(groupPlayers).map((player) => (
              <View key={player.id} style={{ marginBottom: 12 }}>
                <PlayerCard
                  id={Number(player.id)}
                  name={player.name ?? ""}
                  position={
                    positionNameMap[player.position?.toUpperCase() ?? ""] ??
                    player.position
                  }
                  team={teamFullName}
                  avatarUrl={player.imageUrl}
                  number={player.jersey}
                />
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
