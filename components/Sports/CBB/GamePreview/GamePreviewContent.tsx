import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGamesSwitcher from "components/Sports/NBA/GameDetails/LastFiveGames";
import Officials from "components/Sports/NBA/GameDetails/Officials";
import React from "react";
import { BasketballGame } from "types/basketball";
import GameLeaders from "../GameDetails/GameLeaders";
import GameTeamStats from "../GameDetails/GameTeamStats";

type GamePreviewContentProps = {
  game: BasketballGame;
  home: any;
  away: any;
  officials: any;
  lineScore: any;
  leaders: any;
  teamStats: any;
  homeLastGames: any;
  awayLastGames: any;
  playerStats: any;
  data?: any;
  resolvedVenueImage: any;
  resolvedVenueName: any;
  resolvedVenueCity: any;
  resolvedVenueAddress?: string;
  resolvedVenueCapacity: any;
  weather: any;
  highlights: any;
  gameStatusDescription: string;
};

export default function GamePreviewContent({
  game,
  home,
  away,
  officials,
  lineScore,
  leaders,
  homeLastGames,
  awayLastGames,
  playerStats,
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
      contentContainerStyle={{ paddingBottom: 100, gap: 20 }}
    >
      {lineScore && (
        <LineScore
          linescore={lineScore}
          homeCode={home?.code ?? ""}
          awayCode={away?.code ?? ""}
          league={isWomen ? "WCBB" : "CBB"}
          isDark
        />
      )}

      <GameLeaders
        leaders={leaders}
        awayTeamId={Number(away.espnID)}
        homeTeamId={Number(home.espnID)}
        league={isWomen ? "wcbb" : "cbb"}
        gameStatusDescription={gameStatusDescription}
        isDark
      />

      <GameTeamStats
        stats={teamStats}
        gameStatusDescription={gameStatusDescription}
        league={isWomen ? "WCBB" : "CBB"}
        isDark
      />

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
        <LastFiveGamesSwitcher
          isDark={true}
          home={{
            teamId: home?.id,
            teamCode: home?.code ?? "",
            games: homeLastGames?.games ?? [],
          }}
          away={{
            teamId: away?.id,
            teamCode: away?.code ?? "",
            games: awayLastGames?.games ?? [],
          }}
          league={isWomen ? "WCBB" : "CBB"}
        />
      )}

      {playerStats && (
        <BoxScore
          playerStats={playerStats}
          awayTeamId={Number(away.espnId)}
          homeTeamId={Number(home.espnId)}
          league={isWomen ? "WCBB" : "CBB"}
          isDark
        />
      )}

      {highlights.length > 0 && (
        <HighlightVideoList highlights={highlights} isDark />
      )}

      {game?.id && officials?.length > 0 && (
        <Officials
          officials={officials ?? []}
          loading={false}
          error={null}
          isDark
        />
      )}
      {/* Venue Info */}
      {(resolvedVenueImage || resolvedVenueName) && (
        <GameLocation
          venueImage={resolvedVenueImage}
          venueName={resolvedVenueName}
          location={resolvedVenueCity}
          address={resolvedVenueAddress}
          venueCapacity={resolvedVenueCapacity}
          weather={weather}
          isDark
          loading={false}
          error={null}
        />
      )}
    </BottomSheetScrollView>
  );
}
