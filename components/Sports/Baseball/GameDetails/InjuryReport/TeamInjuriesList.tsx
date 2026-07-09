import { globalStyles } from "@/constants/styles";
import { getMLBTeamByEspnId } from "@/constants/teamsMLB";
import { Player } from "@/hooks/LeagueHooks/useRoster";
import { FlatList, Text, View } from "react-native";
import InjuryRow from "./InjuryRow";
import { TeamInjury } from "./TeamInjuries";

type Props = {
  injuries: TeamInjury[];
  teamPlayersMap: Record<string, Player[]>;
  isDark: boolean;
};

type Injury = TeamInjury["injuries"][number];

type FlatItem = {
  teamId: string;
  injury: Injury;
  player?: Player;
  isLast: boolean;
};

const normalizeId = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = String(value).trim();

  return normalizedValue || null;
};

/**
 * Matches a roster player using the ESPN athlete ID.
 */
const findMatchingPlayer = (
  teamPlayers: Player[],
  injury: Injury,
): Player | undefined => {
  const athleteId = normalizeId(injury.athlete.id);

  if (!athleteId) {
    return undefined;
  }

  return teamPlayers.find(
    (player) => normalizeId(player.id) === athleteId,
  );
};

const getTeamPlayers = (
  teamId: string,
  teamPlayersMap: Record<string, Player[]>,
): Player[] => {
  const localTeam = getMLBTeamByEspnId(teamId);

  const possibleKeys = [
    normalizeId(teamId),
    normalizeId(localTeam?.id),
  ].filter((key): key is string => key !== null);

  for (const key of possibleKeys) {
    const players = teamPlayersMap[key];

    if (players?.length) {
      return players;
    }
  }

  return [];
};

export default function TeamInjuriesList({
  injuries,
  teamPlayersMap,
  isDark,
}: Props) {
  const global = globalStyles(isDark);

  const flatItems: FlatItem[] = injuries.flatMap((team) => {
    const teamId = String(team.team.id);
    const teamPlayers = getTeamPlayers(teamId, teamPlayersMap);

    return team.injuries.map((injury, index) => ({
      teamId,
      injury,
      player: findMatchingPlayer(teamPlayers, injury),
      isLast: index === team.injuries.length - 1,
    }));
  });

  return (
    <FlatList
      data={flatItems}
      keyExtractor={(item, index) =>
        `${item.teamId}-${item.injury.athlete.id}-${index}`
      }
      renderItem={({ item }) => (
        <InjuryRow
          injury={item.injury}
          player={item.player}
          isLast={item.isLast}
          isDark={isDark}
        />
      )}
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
  );
}