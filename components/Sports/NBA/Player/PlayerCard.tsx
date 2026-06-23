import placeholder from "assets/Placeholders/playerPlaceholder.png";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { getWNBATeam } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { playerCardStyles } from "styles/PlayerStyles/PlayerCardStyles";
import { LeagueType } from "types/types";

export interface PlayerCardProps {
  id: number;
  name: string;
  position?: string | null;
  teamId: number;
  headshot?: string | null;
  rank?: number | null;
  number?: string | number | null;
  league?: LeagueType;
  statNumber?: string | number | null;
}

type PlayerRoutePathname =
  | "/player/[id]"
  | "/player/wnba/[id]"
  | "/player/mlb/[id]"
  | "/player/nfl/[id]"
  | "/player/mma/[id]"
  | "/player/nhl/[id]"
  | "/player/cfb/[id]"
  | "/player/cbb/[id]";

const LEAGUE_ROUTES: Partial<Record<LeagueType, PlayerRoutePathname>> = {
  NBA: "/player/[id]",
  WNBA: "/player/wnba/[id]",
  MLB: "/player/mlb/[id]",
  NFL: "/player/nfl/[id]",
  UFC: "/player/mma/[id]",
  NHL: "/player/nhl/[id]",
  CFB: "/player/cfb/[id]",
  CBB: "/player/cbb/[id]",
  WCBB: "/player/cbb/[id]",
  CB: "/player/cbb/[id]",
  SB: "/player/cbb/[id]",
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  id,
  name,
  rank,
  teamId,
  headshot,
  number,
  statNumber,
  league = "NBA",
}) => {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerCardStyles(isDark);

  const isNBA = league === "NBA";
  const isWNBA = league === "WNBA";
  const isMLB = league === "MLB";
  const isNFL = league === "NFL";
  const isCFB = league === "CFB";
  const isCBB = league === "CBB";
  const isWCBB = league === "WCBB";
  const isNHL = league === "NHL";

  const team = isNBA
    ? getNBATeam(teamId)
    : isMLB
      ? getMLBTeam(teamId)
      : isNFL
        ? getNFLTeam(teamId)
        : isNHL
          ? getNHLTeam(teamId)
          : isCFB
            ? getCFBTeam(teamId)
            : isWNBA
              ? getWNBATeam(teamId)
              : isCBB
                ? getCBBTeam(teamId, false)
                : isWCBB
                  ? getCBBTeam(teamId, true)
                  : null;

  const teamName = team?.name;

  const displayValue =
    statNumber != null && statNumber !== ""
      ? Number(statNumber).toLocaleString()
      : number != null && number !== ""
        ? `#${number}`
        : null;

  const route = LEAGUE_ROUTES[league];

  const handlePress = () => {
    if (!route) {
      console.warn(`[PlayerCard] No player route configured for ${league}`);
      return;
    }

    if (!teamId) {
      console.warn(`[PlayerCard] No team found for "${teamName}" in ${league}`);
      return;
    }

    router.push({
      pathname: route,
      params: {
        id: String(id),
        teamId: String(teamId),
        league,
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={handlePress}
    >
      <View style={styles.container}>
        {rank ? <Text style={styles.rank}>{rank}</Text> : null}

        <View style={styles.avatarContainer}>
          {headshot ? (
            <Image source={{ uri: headshot }} style={styles.avatar} />
          ) : (
            <Image source={placeholder} style={styles.avatar} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>

          {displayValue ? (
            <Text style={styles.jerseyNumber}>{displayValue}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PlayerCard;