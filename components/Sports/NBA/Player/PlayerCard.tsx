import { teams } from "constants/teams";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCardStyles";
import { LeagueType } from "types/types";

export interface PlayerCardProps {
  id: number;
  name: string | undefined;
  shortName?: string | undefined;
  position?: string | null;
  team: string | null;
  teamId?: number | string | undefined;
  avatarUrl?: string | null;
  rank?: number | null;
  number?: string | number | null;
  league?: LeagueType;
  statNumber?: string | number | null;
}

const LEAGUE_TEAMS = {
  NBA: teams,
  WNBA: wnbaTeams,
  MMA: null,
  NFL: nflTeams,
  NHL: nhlTeams,
  CFB: cfbTeams,
  CBB: cbbTeams,
  WCBB: cbbTeams,
  MLB: mlbTeams,
};

const LEAGUE_ROUTES = {
  NBA: "/player/[id]",
  WNBA: "/player/wnba/[id]",
  MMA: "/player/mma/[id]",
  NFL: "/player/nfl/[id]",
  NHL: "/player/nhl/[id]",
  CFB: "/player/cfb/[id]",
  CBB: "/player/cbb/[id]",
  WCBB: "/player/cbb/[id]",
  MLB: "/player/mlb/[id]",
} as const;

export const PlayerCard: React.FC<PlayerCardProps> = ({
  id,
  name,
  rank,
  team,
  teamId,
  avatarUrl,
  number,
  statNumber,
  league = "NBA",
}) => {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerCardStyles(isDark);

  const teamList = LEAGUE_TEAMS[league];

  const teamObj =
    teamList?.find(
      (t) => t.name === team || t.fullName === team || t.code === team,
    ) ?? null;

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
            teamId: teamId,
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
