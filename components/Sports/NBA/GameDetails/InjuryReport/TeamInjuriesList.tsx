import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { globalStyles } from "constants/styles";
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
  dbPlayer: Player | undefined;
  isLast: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

export default function TeamInjuriesList({
  injuries,
  teamPlayersMap,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);
  const global = globalStyles(isDark);
  // Flatten all injuries across teams into a single array for FlatList
  const flatItems: FlatItem[] = injuries.flatMap((team) => {
    const teamPlayers = teamPlayersMap[String(team.team.id)] ?? [];
    return team.injuries.map((inj, idx) => ({
      teamId: String(team.team.id),
      injury: inj,
      dbPlayer: teamPlayers.find((p) => p.espn_id === Number(inj.athlete.id)),
      isLast: idx === team.injuries.length - 1,
    }));
  });

  const renderItem = ({ item }: { item: FlatItem }) => {
    const { injury: inj, dbPlayer, isLast } = item;
    const avatarUrl = dbPlayer?.avatarUrl || DEFAULT_HEADSHOT;
    const playerName = dbPlayer?.short_name || inj.athlete.fullName;
    const jersey = dbPlayer?.jersey_number || "N/A";
    const position = dbPlayer?.position || "—";

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
    <View style={styles.container}>
      <FlatList
        data={flatItems}
        keyExtractor={(item, index) =>
          `${item.teamId}-${item.injury.athlete.id}-${index}`
        }
        renderItem={renderItem}
        scrollEnabled={false}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>
              No injuries reported for this team.
            </Text>
          </View>
        }
      />
    </View>
  );
}
