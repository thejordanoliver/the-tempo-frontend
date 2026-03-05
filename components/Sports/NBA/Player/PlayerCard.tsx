import { teams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbteams } from "constants/teamsMLB";
import { teams as nflTeams } from "constants/teamsNFL";
import { useRouter } from "expo-router";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCardStyles";

export interface PlayerCardProps {
  id: number;
  name: string | undefined;
  shortName?: string | undefined;
  position?: string | null;
  team: string;
  avatarUrl?: string | null;
  rank?: number | null;
  number?: string | number | null;
  league?: "NBA" | "NFL" | "CFB" | "CBB" | "WCBB" | "MLB";
  statNumber?: string | number | null;
}

const LEAGUE_TEAMS = {
  NBA: teams,
  NFL: nflTeams,
  CFB: cfbTeams,
  CBB: cbbTeams,
  WCBB: cbbTeams,
  MLB: mlbteams,
};

const LEAGUE_ROUTES = {
  NBA: "/player/[id]",
  NFL: "/player/nfl/[id]",
  CFB: "/player/cfb/[id]",
  CBB: "/player/cbb/[id]",
  WCBB: "/player/cbb/[id]",
  MLB: "/player/mlb/[id]",
} as const;

export const PlayerCard: React.FC<PlayerCardProps> = ({
  id,
  name,
  position,
  rank,
  team,
  avatarUrl,
  number,
  statNumber,
  league = "NBA",
}) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = playerCardStyles(isDark);

  const teamList = LEAGUE_TEAMS[league];

const teamObj =
  teamList.find(
    (t) => t.name === team || t.fullName === team || t.code === team,
  ) ?? null;

// Type guard for CBB/WCBB teams
function isCBBTeam(team: any): team is { wid: number; id: number } {
  return team && typeof team.wid === "number";
}

// Determine the team ID to pass in the route
let teamIdForRoute: string | undefined;

if (league === "WCBB" && isCBBTeam(teamObj)) {
  teamIdForRoute = teamObj.wid.toString();
} else {
  teamIdForRoute = teamObj?.id?.toString();
}


  const initial = name?.[0]?.toUpperCase() ?? "?";

  const displayValue =
    statNumber != null && statNumber !== ""
      ? Number(statNumber).toLocaleString()
      : number != null && number !== ""
        ? `#${number}`
        : null;

  const route = LEAGUE_ROUTES[league];

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={styles.card}
      onPress={() => {
        if (!teamObj) {
          console.warn(`[PlayerCard] No team found for "${team}" in ${league}`);
          return;
        }

      router.push({
  pathname: route,
  params: {
    id: id.toString(),
    teamId: teamIdForRoute,
    league,
  },
});

      }}
    >
      <View style={styles.nameContainer}>
        {rank ? <Text style={styles.rank}>{rank}</Text> : null}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>

          {displayValue && (
            <Text style={styles.jerseyNumber}>{displayValue}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PlayerCard;
