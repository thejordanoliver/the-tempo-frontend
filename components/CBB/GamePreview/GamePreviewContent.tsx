import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LineScore } from "components/GameDetails";
import BoxScore from "components/GameDetails/BoxScore";
import GameTeamStats from "components/GameDetails/GameTeamStats";
import LastFiveGamesSwitcher from "components/GameDetails/LastFiveGames";
import Officials from "components/GameDetails/Officials";
import React from "react";
import { View } from "react-native";
import GameLeaders from "../GameDetails/GameLeaders";
import GameOddsSection from "../GameDetails/GameOddsSection";
type GamePreviewContentProps = {
  game: any;
  home: any;
  away: any;
  officials: any;
  lineScore: any;
  gameDateISO: string;  // 👈 full ISO timestamp
  gameDateStr: string;  // 👈 YYYY-MM-DD
  leaders: any;
  homeLastGames: any;
  awayLastGames: any;
  gameStats: any;
  data?: any;
  resolvedVenueAddress?: string;
  isDark?: boolean;
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
}: GamePreviewContentProps) {


  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {lineScore && (
        <View style={{ marginBottom: 20 }}>
          <LineScore
            linescore={lineScore}
            homeCode={home.code}
            awayCode={away.code}
            league="CBB"
            lighter
          />
        </View>
      )}

      {/* Odds */}
      <View style={{ marginBottom: 20 }}>
        <GameOddsSection
          date={gameDateISO}            // 👈 ISO datetime for upcoming odds
          gameDate={gameDateStr}        // 👈 YYYY-MM-DD for historical odds
          awayCode={away.code ?? ""}
          homeCode={home.code ?? ""}
          gameId={String(game?.id ?? "")}
          lighter
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
              teamCode: home?.code,
              teamLogo: home?.logo,
              teamLogoLight: home?.logoLight,
              games: homeLastGames?.games,
            }}
            away={{
              teamCode: away?.code,
              teamLogo: away?.logo,
              teamLogoLight: away?.logoLight,
              games: awayLastGames?.games,
            }}
            league="CBB"
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

      <Officials
        officials={officials ?? []}
        loading={false}
        error={null}
        lighter
      />
    </BottomSheetScrollView>
  );
}
