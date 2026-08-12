// ---- LastFiveGames.tsx ----

import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import HeadingTwo from "components/Headings/HeadingTwo";
import { getNBATeam, getTeamBySummerId, getTeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { lastFiveGameStyles } from "styles/GameDetailStyles/LastFiveGames.styles";

type Opponent = {
  id?: number | string;
  name?: string;
  code?: string;
  abbreviation?: string;
};

type ResolvedTeam = {
  name?: string;
  code?: string;
  abbreviation?: string;
};

export type LastFiveGame = {
  id: number;
  date: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  won: boolean;
  opponentId?: number | null;
  opponent?: string | Opponent | null;
  opponentLogo?: ImageSourcePropType | string | null;
};

type Props = {
  isDark: boolean;
  homeId: number;
  awayId: number;
  homeCode: string;
  awayCode: string;
  homeGames: LastFiveGame[];
  awayGames: LastFiveGame[];
  league: string;
  state?: string | null;
};

export default function LastFiveGames({
  isDark,
  homeId,
  awayId,
  homeCode,
  awayCode,
  homeGames,
  awayGames,
  league,
  state,
}: Props) {
  const styles = lastFiveGameStyles(isDark);

  const hasHomeGames = homeGames.length > 0;
  const hasAwayGames = awayGames.length > 0;

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>(
    hasAwayGames ? "away" : "home",
  );

  const selectedGames = selectedTab === "away" ? awayGames : homeGames;

  const resolveTeam = (teamId?: number | null): ResolvedTeam | undefined => {
    if (teamId == null) {
      return undefined;
    }

    switch (league) {
      case "nba":
        return getNBATeam(teamId);

      case "summercalifornia":
      case "summervegas":
      case "summerutah":
        return getTeamBySummerId(teamId);

      case "wnba":
        return getWNBATeam(teamId);

      case "nfl":
        return getNFLTeam(teamId);

      case "ufl":
        return getUFLTeam(teamId);

      case "nhl":
        return getNHLTeam(teamId);

      case "mlb":
        return getMLBTeam(teamId);

      case "cb":
        return getCBTeam(teamId);

      case "sb":
        return getSBTeam(teamId);

      case "cbb":
        return getCBBTeam(teamId);

      case "wcbb":
        return getWCBBTeam(teamId);

      case "cfb":
        return getCFBTeam(teamId);

      case "socc":
      case "soccer":
        return getSOCCTeam(teamId);

      default:
        return undefined;
    }
  };

  const resolveLogo = (teamId?: number | null) => {
    if (teamId == null) {
      return undefined;
    }

    switch (league) {
      case "nba":
      case "summercalifornia":
      case "summervegas":
      case "summerutah":
        return getTeamLogo(teamId, isDark);

      case "wnba":
        return getWNBATeamLogo(teamId, isDark);

      case "nfl":
        return getNFLTeamLogo(teamId, isDark);

      case "ufl":
        return getUFLTeamLogo(teamId, isDark);

      case "nhl":
        return getNHLTeamLogo(teamId, isDark);

      case "mlb": {
        return getMLBTeamLogo(teamId, isDark);
      }

      case "cb":
        return getCBTeamLogo(teamId, isDark);

      case "sb":
        return getSBTeamLogo(teamId, isDark);

      case "cbb":
        return getCBBTeamLogo(teamId, isDark);

      case "wcbb":
        return getWCBBTeamLogo(teamId, isDark);

      case "cfb":
        return getCFBTeamLogo(teamId, isDark);

      case "socc":
      case "soccer":
        return getSOCCTeamLogo(teamId, isDark);

      default:
        return undefined;
    }
  };

  const getOpponentId = (item: LastFiveGame): number | null => {
    if (item.opponentId != null) {
      return item.opponentId;
    }

    if (typeof item.opponent === "object" && item.opponent?.id != null) {
      const parsedId = Number(item.opponent.id);

      return Number.isFinite(parsedId) ? parsedId : null;
    }

    return null;
  };

  const getOpponentCode = (item: LastFiveGame, fallbackTeam?: ResolvedTeam) => {
    if (fallbackTeam?.code) {
      return fallbackTeam.code;
    }

    if (fallbackTeam?.abbreviation) {
      return fallbackTeam.abbreviation;
    }

    if (typeof item.opponent === "string") {
      return item.opponent;
    }

    return (
      item.opponent?.code ??
      item.opponent?.abbreviation ??
      item.opponent?.name ??
      fallbackTeam?.name ??
      "TBD"
    );
  };

  const renderRow = ({
    item,
    index,
  }: {
    item: LastFiveGame;
    index: number;
  }) => {
    const matchupSymbol = item.isHome ? "vs" : "@";
    const resultSymbol = item.won ? "W" : "L";
    const resultColor = item.won ? styles.colors.win : styles.colors.loss;

    const opponentId = getOpponentId(item);
    const opponent = resolveTeam(opponentId);
    const resolvedOpponentLogo = resolveLogo(opponentId);
    const opponentLogo = resolvedOpponentLogo ?? item.opponentLogo;
    const opponentCode = getOpponentCode(item, opponent);

    const selectedTeamScore = item.isHome ? item.homeScore : item.awayScore;

    const opponentScore = item.isHome ? item.awayScore : item.homeScore;

    return (
      <View
        style={[
          styles.row,
          {
            borderBottomWidth:
              index === selectedGames.length - 1 ? 0 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text style={[styles.cell, styles.date]}>{item.date}</Text>

        <View style={[styles.cell, styles.teamWithLogo]}>
          <Text style={styles.matchupText} numberOfLines={1}>
            {matchupSymbol} {opponentCode}
          </Text>

          {opponentLogo ? (
            <Image
              source={
                typeof opponentLogo === "string"
                  ? { uri: opponentLogo }
                  : opponentLogo
              }
              style={styles.opponentLogo}
              resizeMode="contain"
            />
          ) : null}
        </View>

        <Text style={[styles.cell, { color: resultColor }]}>
          {resultSymbol} {selectedTeamScore} - {opponentScore}
        </Text>
      </View>
    );
  };

  if (!hasHomeGames && !hasAwayGames) {
    return null;
  }

  if (state === "post") {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Last Five Games</HeadingTwo>

      <View style={styles.wrapper}>
        <HomeAwayTabBar
          awayTeam={{
            id: awayId,
            name: awayCode || "AWAY",
            logo: resolveLogo(awayId),
          }}
          homeTeam={{
            id: homeId,
            name: homeCode || "HOME",
            logo: resolveLogo(homeId),
          }}
          selected={selectedTab}
          onTabPress={setSelectedTab}
          isDark={isDark}
          showAllTab={false}
        />

        <FlatList
          data={selectedGames}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderRow}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.date]}>Date</Text>

              <Text style={[styles.cell, styles.teamHeader]}>Matchup</Text>

              <Text style={styles.cell}>Result</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No recent games.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
