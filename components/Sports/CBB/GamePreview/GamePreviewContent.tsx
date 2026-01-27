import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import BoxScore from "components/Sports/NBA/GameDetails/BoxScore";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/HighlightVideoList";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";
import { View } from "react-native";
import { CBBGame } from "types/types";
import GameLeaders from "../GameDetails/GameLeaders";
import GameOddsSection from "../GameDetails/GameOddsSection";
import GameTeamStats from "../GameDetails/GameTeamStats";

type GamePreviewContentProps = {
  game: CBBGame;
  home: any;
  away: any;
  officials: any;
  lineScore: any;
  gameDateISO: string; // 👈 full ISO timestamp
  gameDateStr: string; // 👈 YYYY-MM-DD
  leaders: any;
  teamStats: any;
  homeLastGames: any;
  awayLastGames: any;
  gameStats: any;
  data?: any;
  resolvedVenueImage: any;
  resolvedVenueName: any;
  resolvedVenueCity: any;
  resolvedVenueAddress?: string;
  resolvedVenueCapacity: any;
  weather: any;
  isDark?: boolean;
  highlights: any;
  gameStatusDescription: string;
};

export default function GamePreviewContent({
  game,
  home,
  away,
  officials,
  lineScore,
  gameDateISO,
  gameDateStr,
  leaders,
  homeLastGames,
  awayLastGames,
  gameStats,
  teamStats,
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  weather,
  highlights,
  gameStatusDescription,
}: GamePreviewContentProps) {
  const isWomen = game.league.id === 423;

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {lineScore && (
        <View style={{ marginBottom: 20 }}>
          <LineScore
            linescore={lineScore}
            homeCode={home?.code ?? ""}
            awayCode={away?.code ?? ""}
            league={isWomen ? "WCBB" : "CBB"}
            lighter
          />
        </View>
      )}

      {/* Odds */}
      <View style={{ marginBottom: 20 }}>
        <GameOddsSection
          date={gameDateISO}
          gameDate={gameDateStr}
          awayCode={away?.code ?? ""}
          homeCode={home?.code ?? ""}
          gameId={String(game?.id ?? "")}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <GameLeaders
          leaders={leaders}
          awayTeamId={Number(away.espnID)}
          homeTeamId={Number(home.espnID)}
          league={isWomen ? "wcbb" : "cbb"}
          gameStatusDescription={gameStatusDescription}
          lighter
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <GameTeamStats
          stats={teamStats}
          gameStatusDescription={gameStatusDescription}
          lighter
        />
      </View>

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
        <View style={{ marginBottom: 20 }}>
          <LastFiveGamesSwitcher
            isDark={false}
            lighter
            home={{
              teamCode: home?.code ?? "",
              teamLogo: home?.logo ?? "",
              teamLogoLight: home?.logoLight ?? "",
              games: homeLastGames?.games ?? [],
            }}
            away={{
              teamCode: away?.code ?? "",
              teamLogo: away?.logo ?? "",
              teamLogoLight: away?.logoLight ?? "",
              games: awayLastGames?.games ?? [],
            }}
            league={isWomen ? "WCBB" : "CBB"}
          />
        </View>
      )}

      {game?.id && gameStats?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <BoxScore
            gameId={game.id.toString()}
            homeTeamId={home?.id}
            awayTeamId={away?.id}
          />
        </View>
      )}

      {highlights.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <HighlightVideoList highlights={highlights} lighter />
        </View>
      )}

      {game?.id && officials?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Officials
            officials={officials ?? []}
            loading={false}
            error={null}
            lighter
          />
        </View>
      )}
      {/* Venue Info */}
      {(resolvedVenueImage || resolvedVenueName) && (
        <View style={{ marginBottom: 20 }}>
          <GameLocation
            venueImage={resolvedVenueImage}
            venueName={resolvedVenueName}
            location={resolvedVenueCity}
            address={resolvedVenueAddress}
            venueCapacity={resolvedVenueCapacity}
            weather={weather}
            lighter
            loading={false}
            error={null}
          />
        </View>
      )}
    </BottomSheetScrollView>
  );
}
