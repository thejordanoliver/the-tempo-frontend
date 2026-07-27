import { GameLocation } from "@/components/Sports/NBA/GameDetails";
import GameHeader from "@/components/Sports/Racing/GameDetails/GameHeader";
import { RacingEventCardProps } from "@/types/racing/racing";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/dateUtils";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CustomActivityIndicator from "../../../components/CustomActivityIndicator";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import GameLiveChatOverlay from "../../../components/Sports/NBA/GameDetails/GameChat/GameLiveChatOverlay";
import { usePreferences } from "../../../contexts/PreferencesContext";
import { useScrollFade } from "../../../hooks/useScrollFade";
import { gameDetailsScreenStyles } from "../../../styles/GameDetailStyles/GameDetailsScreenStyles";

type RouteParams = {
  game?: string | string[];
  data?: string | string[];
  leagueId?: string | string[];
  league?: string | string[];
};

type RacingEvent = RacingEventCardProps["game"];

function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseGameParam(value?: string | string[]): RacingEvent | undefined {
  const rawValue = getFirstParam(value);

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return undefined;
  }

  const decodedValue = safeDecode(rawValue).trim();

  // The dynamic route may contain only the event ID.
  // Only attempt JSON parsing when the parameter is an object.
  if (!decodedValue.startsWith("{")) {
    return undefined;
  }

  try {
    return JSON.parse(decodedValue) as RacingEvent;
  } catch {
    return undefined;
  }
}

export default function GameDetailsScreen(
  props: Partial<RacingEventCardProps> = {},
) {
  const styles = gameDetailsScreenStyles;
  const params = useLocalSearchParams<RouteParams>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { opacityAnim, handleScrollStart, handleScrollEnd } = useScrollFade();

  const game = useMemo(() => {
    return (
      props.game ?? parseGameParam(params.data) ?? parseGameParam(params.game)
    );
  }, [params.data, params.game, props.game]);

  const league =
    game?.league ??
    getFirstParam(params.league) ??
    getFirstParam(params.leagueId);

  const gameDate = safeDate(game?.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

  const drivers = game?.drivers ?? [];
  const state = game?.status?.state ?? "pre";
  const gameStatusDescription = game?.status?.description ?? "";

  // Circuit info (was previously mis-mapped onto venue/weather fields)
  const circuitDiagram = game?.venue.image?.href;
  const circuitName = game?.venue.name;
  const venueLocation = `${game?.venue.city}, ${game?.venue.country}`;
  const circuitLength = game?.circuit.length ?? "";
  const circuitLaps = game?.circuit.laps ?? "";
  const circuitEstablished = game?.circuit.established ?? "N/A";
  const isLoading = !game;

  useLayoutEffect(() => {
    if (!game) {
      navigation.setOptions({
        header: () => null,
      });

      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName={league}
          title={game.name ?? ""}
          onBack={() => router.back()}
          isEvent
        />
      ),
    });
  }, [game, league, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        stickyHeaderIndices={[0]}
      >
        <GameHeader
          drivers={drivers}
          gameStatusDescription={gameStatusDescription}
          isDark={isDark}
        />

        <View style={styles.innerContainer}>
          <GameLocation
            venueImage={circuitDiagram}
            venueName={circuitName}
            location={venueLocation}
            address={null}
            venueCapacity={null}
            venueAttendance={null}
            circuitLaps={circuitLaps}
            circuitEstablished={circuitEstablished}
            circuitLength={circuitLength}
            weather={null}
            isDark={isDark}
          />
        </View>
      </ScrollView>

      <GameLiveChatOverlay
        gameId={String(game.id)}
        opacityAnim={opacityAnim}
        state={state}
      />
    </>
  );
}
