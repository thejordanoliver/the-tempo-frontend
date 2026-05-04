import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { Player } from "hooks/NBAHooks/usePlayersByTeam";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import { TeamInjury } from "./TeamInjuries";

type Props = {
  injuries: TeamInjury[];
  teamPlayersMap: Record<string, Player[]>;
  isDark: boolean;
};

type FlatItem = {
  teamId: string;
  injury: TeamInjury["injuries"][number];
  player: Player | undefined;
  isLast: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

export default function TeamInjuriesList({
  injuries,
  teamPlayersMap,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);

  const flatItems: FlatItem[] = injuries.flatMap((team) => {
    const teamPlayers = teamPlayersMap[String(team.team.id)] ?? [];
    return team.injuries.map((inj, idx) => ({
      teamId: String(team.team.id),
      injury: inj,
      player: teamPlayers.find((p) => p.espn_id === Number(inj.athlete.id)),
      isLast: idx === team.injuries.length - 1,
    }));
  });

  const renderItem = ({ item }: { item: FlatItem }) => {
    const { injury: inj, player, isLast } = item;
    const avatarUrl = player?.avatarUrl || DEFAULT_HEADSHOT;
    const playerName = player?.short_name;
    const jersey = player?.jersey_number || "N/A";
    const position = player?.position || "—";

    return (
      <View
        style={[
          styles.injuryItem,
          { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.playerHeader}>
            <Text style={styles.name}>{playerName}</Text>
            <Text style={styles.jersey}>
              {position} #{jersey}
            </Text>
          </View>

          {inj.details?.detail && (
            <Text style={styles.details}>{inj.details.detail}</Text>
          )}

          <Text style={styles.status}>{inj.status}</Text>
        </View>

        {inj.details?.returnDate && (
          <View>
            <Text style={styles.status}>
              Return: {new Date(inj.details.returnDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={flatItems}
      keyExtractor={(item, index) =>
        `${item.teamId}-${item.injury.athlete.id}-${index}`
      }
      renderItem={renderItem}
      scrollEnabled={false}
      removeClippedSubviews={false}
      ListEmptyComponent={
        <View style={styles.emptyItem}>
          <Text style={styles.emptyText}>
            No injuries reported for this team.
          </Text>
        </View>
      }
    />
  );
}
