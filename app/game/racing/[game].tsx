import {
  GameLiveChatOverlay,
  GameLocation,
} from "@/components/Sports/Basketball/GameDetails";
import DriversHeader from "@/components/Sports/Racing/GameDetails/DriversHeader";
import { RacingEventCardProps } from "@/types/racing/racing";
import { shouldShowGameChat } from "@/utils/dateUtils";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect, useMemo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CustomActivityIndicator from "../../../components/CustomActivityIndicator";
import { CustomHeader } from "../../../components/CustomHeader";
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

  const gameDateObj = useMemo(() => {
    return game?.date ? new Date(game.date) : null;
  }, [game]);

  const gameId = game?.id;
  const drivers = game?.drivers ?? [];
  const showGameChat = shouldShowGameChat(gameDateObj);

  const gameStatusDescription = game?.status?.description ?? "";
  const state = game?.status.state ?? "";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const dontShowDetails =
    isCanceled || isPostponed || isSuspended || isForfeited;
  const gameName = game?.name ?? "";
  const circuitDiagram = game?.venue.image?.href;
  const circuitName = game?.venue.name;
  const venueLocation = `${game?.venue.city}, ${game?.venue.country}`;
  const circuitLength = game?.circuit.length ?? "";
  const circuitLaps = game?.circuit.laps ?? "";
  const circuitEstablished = game?.circuit.established ?? "N/A";
  const isLoading = !game;

  useLayoutEffect(() => {
    if (isLoading) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => <CustomHeader tabName={gameName} onBack={goBack} />,
    });
  }, [isLoading, navigation, gameName]);

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
      >
        <DriversHeader
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

      {!dontShowDetails && showGameChat && (
        <GameLiveChatOverlay
          gameId={String(gameId)}
          opacityAnim={opacityAnim}
          state={state}
        />
      )}
    </>
  );
}
