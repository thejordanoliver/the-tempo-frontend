// components/TeamPlayerList.tsx
import PlayerCard from "components/Player/PlayerCard";
import HeadingTwo from "components/Headings/HeadingTwo";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MLBPlayer } from "types/mlb";
import { style } from "../../../styles/TeamDetailsStyles";

interface TeamPlayerListProps {
  players: MLBPlayer[];
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

  // -------------------------
  // Group players by position
  // -------------------------
  const positionGroups: Record<string, MLBPlayer[]> = {
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

  const sortByJersey = (list: MLBPlayer[]) =>
    [...list].sort(
      (a, b) => parseInt(a.jersey ?? "0", 10) - parseInt(b.jersey ?? "0", 10)
    );

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
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : players.length === 0 ? (
        <Text style={styles.errorText}>No players found.</Text>
      ) : (
        Object.entries(positionGroups).map(([groupName, groupPlayers]) => {
          if (groupPlayers.length === 0) return null;

          return (
            <View key={groupName}>
              <HeadingTwo>{groupName}</HeadingTwo>

              {sortByJersey(groupPlayers).map((player) => (
                <View key={player.id} style={{ marginBottom: 12 }}>
                  <PlayerCard
                    id={Number(player.id)}
                    name={player.name ?? ""}
                    position={player.position}
                    team={teamFullName}
                    avatarUrl={player.imageUrl}
                    number={player.jersey}
                  />
                </View>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
