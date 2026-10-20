import { CustomHeader } from "components/CustomHeader";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import {
  BoxScore,
  GameHeader,
  GameLocation,
  GameTeamStats,
  Highlights,
  LineScore,
  Officials,
  PlayByPlay,
} from "components/Sports/Volleyball/GameDetails";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useVolleyballGameDetails } from "hooks/VolleyballHooks/useVolleyballGameDetails";
import { useLayoutEffect } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import { volleyballStyles } from "styles/VolleyballStyles";
import type { VolleyballGameCardProps } from "types/volleyball/volleyball";
import { getVolleyballGameParams } from "utils/navigation/volleyballGame";
import { getVolleyballTeamLogo } from "utils/teams/volleyballTeams";

export default function VolleyballGameScreen(
  props: Partial<VolleyballGameCardProps> = {},
) {
  const params = useLocalSearchParams<{
    game?: string | string[];
    data?: string | string[];
    league?: string | string[];
    leagueId?: string | string[];
  }>();

  const route = getVolleyballGameParams(params, props.game);
  const resource = useVolleyballGameDetails(route.league, route.gameId);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = volleyballStyles(isDark);
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const router = useScopedRouter();
  const navigationContentStyle = useNavigationBarContentStyle();
  const { score, details, warning, loading, refreshing, refresh } = resource;
  const game = score;
  const league = route.league;
  const homeLogo =
    league && game
      ? getVolleyballTeamLogo(game.home.id, league, true)
      : undefined;
  const awayLogo =
    league && game
      ? getVolleyballTeamLogo(game.away.id, league, true)
      : undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Game"
          title={game ? undefined : "Match Details"}
          onBack={router.back}
          league={league ?? undefined}
          homeLogo={homeLogo}
          awayLogo={awayLogo}
          homeTeamCode={game?.home.code ?? undefined}
          awayTeamCode={game?.away.code ?? undefined}
          homeColor={game?.home.primaryColor ?? undefined}
          awayColor={game?.away.primaryColor ?? undefined}
        />
      ),
    });
  }, [navigation, router.back, league, game, homeLogo, awayLogo]);

  if (!score || !details)
    return (
      <View style={[styles.screen, styles.content]}>
        {loading ? (
          <>
            <HeaderSkeleton />
            <GameCardSkeleton />
          </>
        ) : (
          <>
            <Text style={global.secondaryText}>
              {!route.league || !route.gameId
                ? "This match link is invalid."
                : "Unable to load match details."}
            </Text>
            {!!route.league && !!route.gameId && (
              <Pressable accessibilityRole="button" onPress={refresh}>
                <Text style={styles.link}>Try again</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    );

  const homeCode = score.home.code ?? score.home.name ?? "Home";
  const awayCode = score.away.code ?? score.away.name ?? "Away";
  const venue = details.venueInfo;
  const venueAddress = details.venue?.address;
  const dontShowDetails = /cancel|postpon|suspend|forfeit/i.test(
    score.status.gameStatusDescription ?? "",
  );
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={navigationContentStyle(
        gameDetailsScreenStyles.container,
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <GameHeader score={score} isDark={isDark} />
      <View style={gameDetailsScreenStyles.innerContainer}>
        {!!warning && (
          <View style={styles.card}>
            <Text style={global.secondaryText}>
              Unable to refresh this match. Showing the latest loaded details.
            </Text>
            <Pressable accessibilityRole="button" onPress={refresh}>
              <Text style={styles.link}>Retry</Text>
            </Pressable>
          </View>
        )}
        {!dontShowDetails && (
          <>
            <LineScore
              linescore={
                score.periodScores.length
                  ? {
                      home: score.periodScores.map((set) => set.home),
                      away: score.periodScores.map((set) => set.away),
                    }
                  : null
              }
              homeCode={homeCode}
              awayCode={awayCode}
              homeSets={score.home.setsWon ?? score.home.score}
              awaySets={score.away.setsWon ?? score.away.score}
              league={score.league.code}
              state={score.status.state}
              isDark={isDark}
            />
            <GameTeamStats
              stats={score.teamStats.map((team) => ({
                ...team,
                homeAway: team.homeAway ?? undefined,
              }))}
              homeLogo={getVolleyballTeamLogo(
                score.home.id,
                score.league.code,
                isDark,
              )}
              awayLogo={getVolleyballTeamLogo(
                score.away.id,
                score.league.code,
                isDark,
              )}
              homeName={homeCode}
              awayName={awayCode}
              homeColor={score.home.primaryColor ?? undefined}
              awayColor={score.away.primaryColor ?? undefined}
              league={score.league.code}
              state={score.status.state}
              isDark={isDark}
            />
            <BoxScore score={score} isDark={isDark} />
            {!details.available.teamStats && !details.available.playerStats && (
              <Text style={global.secondaryText}>
                {score.status.state === "pre"
                  ? "Team and player statistics will appear here when available."
                  : "Detailed statistics are unavailable for this match."}
              </Text>
            )}
            <PlayByPlay plays={score.plays} isDark={isDark} />
            <Highlights highlights={details.highlights} isDark={isDark} />
            <Officials
              officials={details.officials}
              state={score.status.state}
              isDark={isDark}
            />
          </>
        )}
        {(venue || details.venue) && (
          <GameLocation
            isDark={isDark}
            weather={null}
            venueName={venue?.name ?? details.venue?.fullName}
            venueImage={venue?.image ?? details.venue?.images[0]?.href}
            venueCapacity={venue?.capacity}
            venueAttendance={details.attendance}
            location={[
              venue?.address.city ?? venueAddress?.city,
              venue?.address.state ?? venueAddress?.state,
            ]
              .filter(Boolean)
              .join(", ")}
            address={
              venue?.address.formatted ??
              [
                venue?.address.street,
                venue?.address.city ?? venueAddress?.city,
                venue?.address.state ?? venueAddress?.state,
              ]
                .filter(Boolean)
                .join(", ")
            }
          />
        )}
      </View>
    </ScrollView>
  );
}
