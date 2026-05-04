import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BoxScore from "components/Sports/CBB/GameDetails/BoxScore";
import { GameLocation, LineScore } from "components/Sports/NBA/GameDetails";
import { HighlightVideoList } from "components/Sports/NBA/GameDetails/Highlights/HighlightVideoList";
import LastFiveGames from "components/Sports/NBA/GameDetails/LastFiveGames";
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
  venueImage: any;
  venueName: any;
  venueCity: any;
  venueAddress?: string;
  venueLocation: string;
  venueCapacity: any;
  venueAttendance: string;
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
  venueImage,
  venueName,
  venueCity,
  venueAddress,
  venueCapacity,
  venueLocation,
  venueAttendance,
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
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      <GameTeamStats
        stats={teamStats}
        league={isWomen ? "WCBB" : "CBB"}
        isDark
        gameStatusDescription={gameStatusDescription}
      />

      {/* Last Five Games */}
      {(homeLastGames?.games?.length > 0 ||
        awayLastGames?.games?.length > 0) && (
        <LastFiveGames
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
          gameStatusDescription={gameStatusDescription}
        />
      )}

      <HighlightVideoList highlights={highlights} isDark />

      {game?.id && officials?.length > 0 && (
        <Officials
          officials={officials ?? []}
          isDark
          gameStatusDescription={gameStatusDescription}
        />
      )}
      <GameLocation
        venueImage={venueImage}
        venueName={venueName}
        location={venueLocation}
        address={venueAddress}
        venueCapacity={venueCapacity}
        venueAttendance={venueAttendance}
        weather={weather}
        isDark
      />
    </BottomSheetScrollView>
  );
}
