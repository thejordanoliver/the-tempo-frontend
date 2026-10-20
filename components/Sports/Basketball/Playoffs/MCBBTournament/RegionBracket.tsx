import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg from "react-native-svg";
import { Colors } from "constants/styles";
import type { TournamentRegion } from "hooks/BasketballHooks/useTournamentBracket";
import { BRACKET_LAYOUT, getRegionalDisplayTeams } from "utils/brackets/tournamentBracket.utils";
import { buildRegionRoundSlots } from "utils/brackets/tournamentBracketGames";
import {
  REGIONAL_ROUNDS,
  REGION_ROUNDS_WIDTH,
  REGION_BODY_HEIGHT,
  CARD_LEFT_IN_COLUMN,
  ROUND_OF_64_Y,
  ROUND_OF_32_Y,
  SWEET_16_Y,
  ELITE_8_Y,
  ROUND_Y,
} from "utils/brackets/tournamentBracketLayout";
import { MatchupCard } from "./MatchupCard";
import { ConnectorPair } from "./BracketConnectors";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

type RegionBracketProps = {
  region: TournamentRegion;
  isDark: boolean;
  league: string;
  direction: "ltr" | "rtl";
};
export function RegionBracket({
  region,
  isDark,
  league,
  direction,
}: RegionBracketProps) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const connectorColor = isDark ? Colors.darkGray : Colors.lightGray;

  const roundGames = useMemo(() => buildRegionRoundSlots(region), [region]);
  const displayedRounds =
    direction === "ltr" ? REGIONAL_ROUNDS : [...REGIONAL_ROUNDS].reverse();
  const getVisualColumnIndex = (roundIndex: number) =>
    direction === "ltr" ? roundIndex : REGIONAL_ROUNDS.length - 1 - roundIndex;

  return (
    <View style={styles.regionContainer}>
      <View
        style={{
          height: BRACKET_LAYOUT.regionHeaderHeight,
          alignItems: direction === "ltr" ? "flex-start" : "flex-end",
          justifyContent: "center",
          paddingHorizontal: CARD_LEFT_IN_COLUMN,
        }}
      >
        <Text style={styles.regionTitle}>{region.name} Region</Text>
      </View>

      <View
        style={[
          styles.regionRounds,
          {
            position: "relative",
            width: REGION_ROUNDS_WIDTH,
            height: REGION_BODY_HEIGHT,
          },
        ]}
      >
        <Svg
          pointerEvents="none"
          width={REGION_ROUNDS_WIDTH}
          height={REGION_BODY_HEIGHT}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <ConnectorPair
            sourceYs={ROUND_OF_64_Y}
            destinationYs={ROUND_OF_32_Y}
            sourceColumnIndex={getVisualColumnIndex(0)}
            destinationColumnIndex={getVisualColumnIndex(1)}
            color={connectorColor}
            direction={direction}
          />

          <ConnectorPair
            sourceYs={ROUND_OF_32_Y}
            destinationYs={SWEET_16_Y}
            sourceColumnIndex={getVisualColumnIndex(1)}
            destinationColumnIndex={getVisualColumnIndex(2)}
            color={connectorColor}
            direction={direction}
          />

          <ConnectorPair
            sourceYs={SWEET_16_Y}
            destinationYs={ELITE_8_Y}
            sourceColumnIndex={getVisualColumnIndex(2)}
            destinationColumnIndex={getVisualColumnIndex(3)}
            color={connectorColor}
            direction={direction}
          />
        </Svg>

        {displayedRounds.map((round) => {
          const games = roundGames[round];
          const yPositions = ROUND_Y[round];

          return (
            <View
              key={round}
              style={[
                styles.roundColumn,
                {
                  position: "relative",
                  height: REGION_BODY_HEIGHT,
                  zIndex: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.roundMatchups,
                  {
                    position: "relative",
                    height: REGION_BODY_HEIGHT,
                  },
                ]}
              >
                {yPositions.map((yPosition, index) => (
                  <View
                    key={`${round}-${index}`}
                    style={{
                      position: "absolute",
                      top: yPosition,
                      left: CARD_LEFT_IN_COLUMN,
                    }}
                  >
                    <MatchupCard
                      game={games[index]}
                      displayTeams={
                        games[index]
                          ? getRegionalDisplayTeams(games[index], round, index)
                          : undefined
                      }
                      isDark={isDark}
                      league={league}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
