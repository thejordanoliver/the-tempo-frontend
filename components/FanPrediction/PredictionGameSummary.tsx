import { Ionicons } from "@expo/vector-icons";
import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import teamPlaceholder from "assets/Placeholders/teamPlaceholder.png";
import { BasesIndicator } from "components/Sports/Baseball/GameDetails/BasesIndicator";
import { Colors } from "constants/styles";

import { useMemo } from "react";
import { Image, Text, View } from "react-native";
import { FanPredictionHistoryRowStyles } from "styles/FanPredictionStyles/FanPredictionHistoryRowStyles";
import { GameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import type {
  FanPredictionGameTeam,
  FanPredictionPick,
} from "types/fanPredictions";
import { formatDate, formatTime, safeDate } from "utils/common/dateUtils";
import { gameTeamIdsMatch } from "utils/games/gameTeamIdentity";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "utils/games/games";
import { getPredictionTeamHelpers } from "utils/games/predictionTeamHelpers";

type Props = {
  pick: FanPredictionPick;
  isDark: boolean;
};

export default function PredictionGameSummary({ pick, isDark }: Props) {
  const styles = useMemo(() => FanPredictionHistoryRowStyles(isDark), [isDark]);
  const gameStyles = useMemo(() => GameCardStyles(isDark), [isDark]);
  const game = pick.game?.sport === pick.sport ? pick.game : undefined;
  const state = game?.status.completed
    ? "post"
    : (game?.status.state ?? pick.state);
  const isLive = state === "in";
  const isFinal = state === "post";
  const description = game?.status.description ?? "";
  const detail =
    game?.status.shortDetail || pick.statusDescription || description;
  const interrupted =
    /delay|suspend|postpone|cancel|abandon|forfeit|no contest/i.test(
      description || detail || "",
    );
  const showRecord = state === "pre" || interrupted;
  const date = safeDate(game?.date ?? pick.startsAt);
  const helpers = getPredictionTeamHelpers(pick.sport, pick.league);
  const period = formatPeriod({
    period: game?.status.period,
    isMCBB: pick.league === "mcbb",
    isNHL: pick.sport === "hockey",
    isSOCC: pick.sport === "soccer",
    isMMA: pick.sport === "mma",
  });
  const clock = game?.status.displayClock;
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const football = game?.sport === "football" ? game.situation : undefined;
  const baseball = game?.sport === "baseball" ? game.situation : undefined;
  const mma = game?.sport === "mma" ? game : undefined;

  const renderTeam = (side: "away" | "home") => {
    const savedTeam = pick[side];
    const snapshotTeam = game?.[side];
    const team: Partial<FanPredictionGameTeam> = {
      ...savedTeam,
      ...snapshotTeam,
    };
    const id = team.id;
    const athlete = mma?.competitors?.find((fighter) =>
      gameTeamIdsMatch(fighter.id, id),
    );
    const localTeam = id == null ? undefined : helpers?.getTeam(id);
    const name =
      athlete?.shortName ||
      localTeam?.shortName ||
      localTeam?.name ||
      team.shortName ||
      team.code ||
      team.name ||
      side.toUpperCase();
    const logo =
      pick.sport === "mma"
        ? athlete?.headshot
          ? { uri: athlete.headshot }
          : playerPlaceholder
        : localTeam && helpers
          ? helpers.getLogo(id ?? undefined, isDark)
          : team.logo
            ? { uri: team.logo }
            : teamPlaceholder;
    const rank = team.rank ?? (side === "home" ? team.homeRank : team.awayRank);
    const isWinner = isFinal && gameTeamIdsMatch(id, pick.winnerId);
    const value =
      pick.sport === "mma" || showRecord
        ? (athlete?.record ?? team.record)
        : pick.sport === "volleyball"
          ? (team.setsWon ?? team.score)
          : team.score;
    const score = (
      <View style={styles.scoreSection}>
        <Text
          style={
            showRecord || pick.sport === "mma"
              ? styles.record
              : [
                  styles.score,
                  winnerStyle({
                    isDark,
                    isWinner,
                    isTie: !isFinal || !pick.winnerId,
                  }),
                ]
          }
        >
          {value ?? "—"}
        </Text>
        {isLive && football && gameTeamIdsMatch(football.possession, id) && (
          <Ionicons
            name="american-football"
            size={14}
            color={isDark ? Colors.white : Colors.black}
            accessibilityLabel="Possession"
          />
        )}
        {pick.sport === "mma" && isWinner && (
          <Ionicons
            name="caret-up"
            size={14}
            color={isDark ? Colors.white : Colors.black}
            accessibilityLabel="Winner"
          />
        )}
      </View>
    );
    const participant = (
      <View style={styles.team}>
        <View
          style={pick.sport === "mma" ? gameStyles.fighterContainer : undefined}
        >
          <Image
            source={logo}
            style={pick.sport === "mma" ? gameStyles.fighter : gameStyles.logo}
            resizeMode="contain"
            accessibilityLabel={name}
          />
        </View>

        <Text
          style={gameStyles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {rank != null && rank > 0 && (
            <Text style={gameStyles.rank}>{rank} </Text>
          )}
          {name}
        </Text>
      </View>
    );
    return side === "away" ? (
      <>
        {participant}
        {score}
      </>
    ) : (
      <>
        {score}
        {participant}
      </>
    );
  };

  const renderStatus = () => {
    if (interrupted) {
      return <Text style={gameStyles.finalText}>{description || detail}</Text>;
    }
    if (isFinal) {
      const method = mma?.method
        ?.replace(/^submission$/i, "SUB")
        .replace(/^decision$/i, "DEC");
      return (
        <View style={gameStyles.infoWrapper}>
          <Text style={gameStyles.finalText}>
            {method || detail || "Final"}
          </Text>
          <View style={gameStyles.finalStatusDivider} />
          <Text style={gameStyles.finalText}>{formatDate(date)}</Text>
        </View>
      );
    }
    if (isLive) {
      if (/halftime|end of|walkouts|intros|pre-fight/i.test(description)) {
        return <Text style={gameStyles.clock}>{description}</Text>;
      }
      if (pick.sport === "baseball") {
        const betweenInnings = /end|mid/i.test(detail ?? "");
        const outs = baseball?.outs;
        return (
          <>
            <Text style={gameStyles.date}>
              {detail ||
                (game?.status.period ? `Inning ${game.status.period}` : "Live")}
            </Text>
            {baseball && !betweenInnings && (
              <>
                {outs != null && (
                  <View
                    style={gameStyles.outsContainer}
                    accessibilityLabel={`${outs} outs`}
                  >
                    {[1, 2, 3].map((out) => (
                      <Ionicons
                        key={out}
                        name={out <= outs ? "ellipse" : "ellipse-outline"}
                        size={8}
                        color={isDark ? Colors.dark.lightRed : Colors.light.red}
                      />
                    ))}
                  </View>
                )}
                {baseball.onFirst != null &&
                  baseball.onSecond != null &&
                  baseball.onThird != null && (
                    <BasesIndicator
                      size={8}
                      bases={{
                        onFirst: baseball.onFirst,
                        onSecond: baseball.onSecond,
                        onThird: baseball.onThird,
                      }}
                      isDark={isDark}
                    />
                  )}
              </>
            )}
          </>
        );
      }
      if (pick.sport === "volleyball") {
        const set =
          game?.sport === "volleyball"
            ? game.sets?.find((item) => item.number === game.status.period)
            : undefined;
        return (
          <>
            <Text style={gameStyles.period}>
              {game?.status.period
                ? `Set ${game.status.period}`
                : detail || "Live"}
            </Text>
            {set && (
              <Text style={gameStyles.clock}>
                {set.away ?? "—"} – {set.home ?? "—"}
              </Text>
            )}
          </>
        );
      }
      return (
        <>
          <View style={gameStyles.infoWrapper}>
            <Text style={gameStyles.period}>{period || detail || "Live"}</Text>
            {!!clock && (
              <>
                <View style={gameStyles.statusDivider} />
                <Text style={gameStyles.clock}>{clock}</Text>
              </>
            )}
          </View>
          {!!football?.downDistanceText && (
            <Text
              style={[
                gameStyles.downDistance,
                football.isRedZone && {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              {football.downDistanceText}
            </Text>
          )}
        </>
      );
    }
    if (state === "pre") {
      return (
        <View style={gameStyles.infoWrapper}>
          <Text style={gameStyles.date}>{formatDate(date)}</Text>
          <View style={gameStyles.statusDivider} />
          <Text style={gameStyles.date}>
            {/TBD/i.test(detail ?? "") ? "TBD" : formatTime(date)}
          </Text>
        </View>
      );
    }
    return (
      <Text style={gameStyles.date}>{detail || "Details unavailable"}</Text>
    );
  };

  return (
    <View>
      <View style={styles.card}>
        {renderTeam("away")}

        <View style={styles.info}>
          {renderStatus()}
          {!isFinal && !!broadcast && (
            <Text style={gameStyles.broadcast}>{broadcast}</Text>
          )}
        </View>

        {renderTeam("home")}
      </View>
    </View>
  );
}
