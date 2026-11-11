import { useScrollFade } from "@/hooks/useScrollFade";
import { useWeather } from "@/hooks/useWeather";
import { formatVenueAddress } from "@/utils/games/games";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeader } from "components/CustomHeader";
import { GameHeaderPlaceholder } from "components/CustomHeader/GameHeaderPlaceholder";
import {
  GameHeader,
  LineScore,
  Venue,
} from "components/Sports/Volleyball/GameDetails";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useVolleyballGameDetails } from "hooks/VolleyballHooks/useVolleyballGameDetails";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { gameDetailsScreenStyles } from "styles/GameDetailStyles/GameDetailsScreenStyles";
import type { VolleyballGameCardProps } from "types/volleyball/volleyball";
import { getVolleyballGameParams } from "utils/navigation/volleyballGame";
import {
  getVolleyballTeam,
  getVolleyballTeamLogo,
} from "utils/teams/volleyballTeams";

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
  const styles = gameDetailsScreenStyles;
  const navigation = useNavigation();
  const router = useScopedRouter();
  const navigationContentStyle = useNavigationBarContentStyle();
  const { handleScrollStart, handleScrollEnd } = useScrollFade();

  const { score, details, loading } = resource;

  const game = score;

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game]);

  const league = route.league ?? "mcvb";

  const home = game?.home;
  const away = game?.away;
  const homeId = home?.id ?? 0;
  const awayId = away?.id ?? 0;

  const homeTeam = getVolleyballTeam(homeId, league);
  const awayTeam = getVolleyballTeam(awayId, league);

  const homeLogo =
    league && game ? getVolleyballTeamLogo(homeId, league, true) : undefined;
  const awayLogo =
    league && game ? getVolleyballTeamLogo(awayId, league, true) : undefined;

  const isLoading = !score || !details || !game || !home || !away;

  useLayoutEffect(() => {
    if (isLoading && loading) {
      navigation.setOptions({ header: () => <GameHeaderPlaceholder /> });
      return;
    }

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
  }, [
    navigation,
    router.back,
    league,
    game,
    homeLogo,
    awayLogo,
    isLoading,
    loading,
  ]);

  const homeCode = score?.home.code ?? score?.home.name ?? "Home";
  const awayCode = score?.away.code ?? score?.away.name ?? "Away";

  const gameStatusDescription = score?.status.gameStatusDescription;
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isCanceled || isPostponed || isSuspended || isForfeited;

  const baseVenue = details?.venue;
  const venue = details?.venueInfo;
  const { weather } = useWeather({
    lat: venue?.latitude,
    lon: venue?.longitude,
    location: venue?.address.city,
    date: gameDateObj,
  });
  const baseVenueAddress = formatVenueAddress(baseVenue?.address);
  const venueName = venue?.name ?? baseVenue?.fullName ?? null;
  const venueAddress =
    venue?.address.formatted ??
    (formatVenueAddress(venue?.address) || baseVenueAddress);
  const venueCapacity = venue?.capacity ?? null;
  const venueImage = venue?.image ?? baseVenue?.images?.[0]?.href ?? null;
  const venueAttendance = details?.attendance ?? null;

  const venueCity = venue?.address.city ?? baseVenue?.address?.city;
  const venueRegion =
    venue?.address.state ??
    venue?.address.country ??
    baseVenue?.address?.state ??
    baseVenue?.address?.country;
  const venueLocation =
    venueCity && venueRegion
      ? `${venueCity}, ${venueRegion}`
      : (venueCity ?? "");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (isLoading || !homeTeam || !awayTeam) return <View />;

  return (
    <ScrollView
      contentContainerStyle={navigationContentStyle(styles.container)}
      onScrollBeginDrag={handleScrollStart}
      onMomentumScrollEnd={handleScrollEnd}
      stickyHeaderIndices={[0]}
    >
      <GameHeader score={score} isDark={isDark} />
      <View style={styles.innerContainer}>
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

            <Venue
              venueImage={venueImage}
              venueName={venueName}
              location={venueLocation}
              address={venueAddress}
              venueCapacity={venueCapacity}
              venueAttendance={venueAttendance}
              weather={weather}
              isDark={isDark}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}
