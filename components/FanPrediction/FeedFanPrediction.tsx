import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { Colors, globalStyles } from "constants/styles";
import { useFeedPredictionInput } from "hooks/FanPredictionHooks/useFeedPrediction";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FeedPrediction, FeedPredictionTeam } from "types/fanPredictions";
import { formatDate } from "utils/common/dateUtils";
import { getPredictionTeamHelpers } from "utils/games/predictionTeamHelpers";
import FanPrediction from "./FanPrediction";

export default function FeedFanPrediction({
  game,
  isDark,
}: {
  game: FeedPrediction;
  isDark: boolean;
}) {
  const input = useFeedPredictionInput(game);
  const router = useScopedRouter();
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const theme = isDark ? Colors.dark : Colors.light;
  const helpers = getPredictionTeamHelpers(game.sport, game.league);
  const teamLogo = (team: FeedPredictionTeam) =>
    helpers?.getTeam(team.id)
      ? helpers.getLogo(team.id, isDark)
      : team.logo
        ? { uri: team.logo }
        : undefined;
  const teamColor = (team: FeedPredictionTeam) =>
    helpers?.getTeam(team.id)?.primaryColor ||
    team.primaryColor ||
    Colors.midTone;

  const openGame = () =>
    router.push({
      pathname: "/game/[sport]/[game]",
      params: {
        sport: game.sport,
        game: String(game.gameId),
        league: game.league,
        leagueId: game.league,
        data: encodeURIComponent(
          JSON.stringify(
            game.game ?? {
              id: game.gameId,
              league: { code: game.league },
              date: game.startsAt,
              home: game.home,
              away: game.away,
              status: { state: input.state },
            },
          ),
        ),
      },
    });

  return (
    <View style={styles.container}>
      <FanPrediction
        {...input}
        awayLogo={teamLogo(game.away)}
        awayColor={teamColor(game.away)}
        homeLogo={teamLogo(game.home)}
        homeColor={teamColor(game.home)}
      >
        <View style={[styles.gameInfo, { borderBottomColor: theme.gray }]}>
          <View style={styles.gameMeta}>
            <Text style={global.label}>{game.league.toUpperCase()}</Text>
            <Text style={global.caption}>
              {formatDate(game.startsAt, false, true)}
            </Text>
          </View>
          <Button
            onPress={openGame}
            isDark={isDark}
            variant="text"
            accessibilityLabel={`Game details: ${game.away.name} at ${game.home.name}`}
            style={styles.gameLink}
          >
            <Text numberOfLines={2} style={[global.subtitle, styles.matchup]}>
              {game.away.name} at {game.home.name}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.secondaryText}
              accessible={false}
            />
          </Button>
        </View>
      </FanPrediction>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gameInfo: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  gameMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  gameLink: {
    padding: 0,
    justifyContent: "space-between",
    gap: 8,
  },
  matchup: {
    flex: 1,
  },
});
