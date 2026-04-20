import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { globalStyles } from "constants/styles";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";

export interface Injury {
  status: string;
  date?: string;
  athlete: {
    id: string;
    displayName: string;
    shortName?: string;
    headshot?: { href: string };
    position?: { displayName?: string; abbreviation?: string };
    jersey?: string;
  };
  details?: {
    type?: string;
    location?: string;
    returnDate?: string;
  };
}

export interface TeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: Injury[];
}

type FlatItem = {
  injury: Injury;
  teamId: string;
  isLast: boolean;
};

type Props = {
  injuries: TeamInjuries[];
  isDark: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

export default function TeamInjuriesList({ injuries, isDark }: Props) {
  const styles = teamInjuryStyles(isDark);
  const global = globalStyles(isDark);

  if (!injuries?.length) return null;

  const flatItems: FlatItem[] = injuries.flatMap((team) =>
    team.injuries.map((injury, idx) => ({
      injury,
      teamId: team.team.id,
      isLast: idx === team.injuries.length - 1,
    })),
  );

  const renderItem = ({ item }: { item: FlatItem }) => {
    const { injury, isLast } = item;
    const player = injury.athlete;
    const avatarUrl = player.headshot?.href ?? DEFAULT_HEADSHOT;

    return (
      <View
        style={[
          styles.injuryItem,
          { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <Image
          source={
            typeof avatarUrl === "string" ? { uri: avatarUrl } : avatarUrl
          }
          style={styles.avatarWrapper}
          resizeMode="cover"
        />

        <View style={{ flex: 1 }}>
          <View style={styles.infoSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.name}>{player.shortName ?? player.displayName}</Text>
              <Text style={styles.jersey}>
                {player?.position?.abbreviation ?? "—"}{" "}
                {player?.jersey ? `#${player.jersey}` : ""}
              </Text>
            </View>

            {injury.details?.type && (
              <>
                <Text style={styles.status}>{injury.status}</Text>
                <Text style={styles.details}>
                  {injury.details.type} — {injury.details.location ?? "N/A"}
                </Text>
              </>
            )}
          </View>
        </View>

        {injury.details?.returnDate && (
          <Text style={styles.status}>
            Return:{" "}
            {new Date(injury.details.returnDate).toLocaleDateString("en-US")}
          </Text>
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
          <Text style={global.emptyText}>No injuries reported.</Text>
        }
      />
    </View>
  );
}