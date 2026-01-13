import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GameLocation, LineScore } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import { HighlightVideoList } from "components/GameDetails/HighlightVideoList";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import Officials from "components/GameDetails/Officials";
import React from "react";
import { View } from "react-native";
import { CBBGame } from "types/types";
import GameLeaders from "../GameDetails/GameLeaders";
import GameOddsSection from "../GameDetails/GameOddsSection";
type GamePreviewContentProps = {
  game: CBBGame;
  home: any;
  away: any;
  officials: any;
  lineScore: any;
  gameDateISO: string; // 👈 full ISO timestamp
  gameDateStr: string; // 👈 YYYY-MM-DD
  leaders: any;
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
  resolvedVenueImage,
  resolvedVenueName,
  resolvedVenueCity,
  resolvedVenueAddress,
  resolvedVenueCapacity,
  weather,
  highlights,
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

      {leaders &&
        (leaders?.home?.length > 0 ||
          leaders?.away?.length > 0 ||
          leaders?.length > 0) && (
          <View style={{ marginBottom: 20 }}>
            <GameLeaders
              leaders={leaders}
              awayTeamId={Number(away.espnID)}
              homeTeamId={Number(home.espnID)}
              league={isWomen ? "wcbb" : "cbb"}
              lighter
            />
          </View>
        )}

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
        <>
          <View style={{ marginBottom: 20 }}>
            <BoxScore
              gameId={game.id.toString()}
              homeTeamId={home?.id}
              awayTeamId={away?.id}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <GameTeamStats stats={gameStats} lighter />
          </View>
        </>
      )}
      <View style={{ marginBottom: 20 }}>
        {highlights.length > 0 && (
          <HighlightVideoList highlights={highlights} lighter />
        )}
      </View>
      <View style={{ marginBottom: 20 }}>
        <Officials
          officials={officials ?? []}
          loading={false}
          error={null}
          lighter
        />
      </View>

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
