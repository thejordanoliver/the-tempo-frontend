import { Player } from "@/hooks/LeagueHooks/useRoster";
import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import { getTeamByESPNId } from "constants/teams";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import { TeamInjury } from "./TeamInjuries";

type Props = {
  injuries: TeamInjury[];
  teamPlayersMap: Record<string, Player[]>;
  isDark: boolean;
  league: "NBA" | "WNBA";
};

type FlatItem = {
  teamId: string;
  injury: TeamInjury["injuries"][number];
  player: Player | undefined;
  isLast: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

const normalizeName = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDisplayValue = (value: unknown, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    const objectValue = value as {
      abbreviation?: string;
      displayName?: string;
      name?: string;
    };

    return (
      objectValue.abbreviation ||
      objectValue.displayName ||
      objectValue.name ||
      fallback
    );
  }

  return fallback;
};

const getPlayerIds = (player: Player) => {
  return [
    toNumber(player.espn_id),
    toNumber(player.player_id),
    toNumber(player.id),
  ].filter((id): id is number => id !== null);
};

const findMatchingPlayer = (
  teamPlayers: Player[],
  injury: TeamInjury["injuries"][number],
) => {
  const athleteId = toNumber(injury.athlete.id);

  if (athleteId !== null) {
    const idMatch = teamPlayers.find((player) =>
      getPlayerIds(player).includes(athleteId),
    );

    if (idMatch) return idMatch;
  }

  const injuryName = normalizeName(injury.athlete.fullName);

  return teamPlayers.find((player) => {
    const fullName = normalizeName(player.full_name);
    const shortName = normalizeName(player.short_name);
    const firstLastName = normalizeName(
      `${player.first_name ?? ""}${player.last_name ?? ""}`,
    );

    return (
      fullName === injuryName ||
      shortName === injuryName ||
      firstLastName === injuryName
    );
  });
};

const getTeamPlayers = (
  teamId: string,
  league: "NBA" | "WNBA",
  teamPlayersMap: Record<string, Player[]>,
) => {
  const localTeam =
    league === "WNBA" ? getWNBATeamByESPNId(teamId) : getTeamByESPNId(teamId);

  const possibleKeys = [teamId, String(localTeam?.id ?? "")].filter(Boolean);

  for (const key of possibleKeys) {
    const players = teamPlayersMap[key];

    if (players?.length) {
      return players;
    }
  }

  return [];
};

const getAvatarSource = (
  player: Player | undefined,
  injury: TeamInjury["injuries"][number],
): ImageSourcePropType => {
  const url = player?.headshot_url || injury.athlete.headshot;

  if (url) {
    return { uri: url };
  }

  return DEFAULT_HEADSHOT;
};

export default function TeamInjuriesList({
  injuries,
  teamPlayersMap,
  isDark,
  league,
}: Props) {
  const styles = teamInjuryStyles(isDark);

  const flatItems: FlatItem[] = injuries.flatMap((team) => {
    const teamId = String(team.team.id);
    const teamPlayers = getTeamPlayers(teamId, league, teamPlayersMap);

    return team.injuries.map((injury, index) => ({
      teamId,
      injury,
      player: findMatchingPlayer(teamPlayers, injury),
      isLast: index === team.injuries.length - 1,
    }));
  });

  const renderItem = ({ item }: { item: FlatItem }) => {
    const { injury: inj, player, isLast } = item;

    const avatarSource = getAvatarSource(player, inj);
    const playerName = getDisplayValue(player?.short_name || "Unknown Player");
    const jersey = getDisplayValue(player?.jersey_number || "N/A");
    const position = getDisplayValue(player?.position || "—");

    return (
      <View
        style={[
          styles.injuryItem,
          { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <Image source={avatarSource} style={styles.avatar} />
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
