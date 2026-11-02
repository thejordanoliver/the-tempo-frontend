import { Divider, HStack, Link, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type {
  DeviceGameWidgetConfiguration,
  DeviceGameWidgetProps,
} from "types/deviceGameWidget";

const FavoriteGamesWidget = (
  props: DeviceGameWidgetProps,
  environment: WidgetEnvironment<DeviceGameWidgetConfiguration>,
) => {
  "widget";
  // Imported constants do not exist in WidgetKit's isolated runtime. The app
  // supplies the shared color and font tokens in props before publishing.
  const scheme =
    props.colorScheme === "system" || !props.colorScheme
      ? (environment.colorScheme ?? "light")
      : props.colorScheme;
  const palette = props.palettes?.[scheme];
  const text = palette?.text ?? "primary";
  const secondary = palette?.secondary ?? "secondary";
  const small = environment.widgetFamily === "systemSmall";
  const large = environment.widgetFamily === "systemLarge";
  const league = environment.configuration?.league ?? "all";
  const games = (props.games ?? [])
    .filter((game) => league === "all" || game.league === league)
    .slice(0, large ? 3 : 1);
  const defaultURL = props.url || "tempo:///(tabs)/(explore)/explore";

  return (
    <VStack
      alignment="leading"
      spacing={large ? 10 : 6}
      modifiers={[
        frame({
          maxWidth: Infinity,
          maxHeight: Infinity,
          alignment: "topLeading",
        }),
        ...(palette ? [containerBackground(palette.background, "widget")] : []),
        widgetURL(small && games[0] ? games[0].url : defaultURL),
      ]}
    >
      <HStack spacing={4}>
        <Text
          modifiers={[
            font({ size: 11, family: props.fonts?.MEDIUM, weight: "medium" }),
            foregroundStyle(text),
          ]}
        >
          TEMPO
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({
              size: 10,
              family: props.fonts?.SEMIBOLD,
              weight: "semibold",
            }),
            foregroundStyle(secondary),
            lineLimit(1),
          ]}
        >
          {league === "all" ? "FAVORITE GAMES" : league.toUpperCase()}
        </Text>
      </HStack>
      {games.length ? (
        games.map((game, index) => (
          <Link key={game.key} destination={game.url}>
            <VStack
              alignment="leading"
              spacing={small ? 5 : 4}
              modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}
            >
              {index > 0 ? <Divider /> : null}
              <HStack spacing={4}>
                <Text
                  modifiers={[
                    font({
                      size: 10,
                      family: props.fonts?.MEDIUM,
                      weight: "medium",
                    }),
                    foregroundStyle(
                      game.live && !props.stale
                        ? (palette?.live ?? "red")
                        : secondary,
                    ),
                    lineLimit(1),
                    minimumScaleFactor(0.7),
                  ]}
                >
                  {`${game.league.toUpperCase()} · ${game.live && !props.stale ? "LIVE · " : ""}${props.stale ? "Last: " : ""}${game.status}`}
                </Text>
                <Spacer minLength={0} />
              </HStack>
              {[game.away, game.home].map((team, teamIndex) => (
                <HStack key={`${game.key}:${teamIndex}`} spacing={6}>
                  <Text
                    modifiers={[
                      font({
                        size: 14,
                        family: props.fonts?.BOLD,
                        weight: "bold",
                      }),
                      foregroundStyle(team.color),
                    ]}
                  >
                    ▎
                  </Text>
                  <Text
                    modifiers={[
                      font({
                        size: small ? 18 : 16,
                        family: props.fonts?.MEDIUM,
                        weight: "medium",
                      }),
                      foregroundStyle(text),
                      lineLimit(1),
                      minimumScaleFactor(0.7),
                    ]}
                  >
                    {small ? team.code : team.name}
                  </Text>
                  <Spacer minLength={4} />
                  <Text
                    modifiers={[
                      font({
                        size: small ? 22 : 20,
                        weight: "heavy",
                        design: "rounded",
                      }),
                      monospacedDigit(),
                      foregroundStyle(text),
                      lineLimit(1),
                      minimumScaleFactor(0.7),
                    ]}
                  >
                    {team.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Link>
        ))
      ) : (
        <VStack
          alignment="leading"
          spacing={6}
          modifiers={[padding({ top: 8 })]}
        >
          <Text
            modifiers={[
              font({ size: 16, family: props.fonts?.BOLD, weight: "bold" }),
              foregroundStyle(text),
              lineLimit(2),
            ]}
          >
            {props.games?.length
              ? "No games in this league"
              : props.title || "Favorite Games"}
          </Text>
          <Text
            modifiers={[
              font({ size: 12 }),
              foregroundStyle(secondary),
              lineLimit(3),
            ]}
          >
            {props.games?.length
              ? "Choose another league or edit your favorites in Tempo."
              : props.message ||
                "Open Tempo to load your favorite teams and games."}
          </Text>
        </VStack>
      )}
      <Spacer minLength={0} />
      <Text
        modifiers={[
          font({ size: 9 }),
          foregroundStyle(secondary),
          lineLimit(1),
        ]}
      >
        {props.stale
          ? "Open Tempo to refresh"
          : games.length
            ? props.updatedLabel
            : "Tap to open Tempo"}
      </Text>
    </VStack>
  );
};

export default createWidget<DeviceGameWidgetProps, DeviceGameWidgetConfiguration>(
  "TempoFavoriteGames",
  FavoriteGamesWidget,
);
