import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";

import Fill from "assets/banners/Fill.png";
import Outline from "assets/banners/Outline.png";
import OutlineLight from "assets/banners/OutlineLight.png";
import { teams as nbaTeams } from "../constants/teams";
import { teams as cbbTeams } from "../constants/teamsCBB";
import { teams as cfbTeams } from "../constants/teamsCFB";
import { teams as mlbTeams } from "../constants/teamsMLB";
import { teams as nflTeams } from "../constants/teamsNFL";

import { Fonts } from "constants/fonts";
import { LeagueType } from "types/types";
import { Colors } from "constants/Colors";

type Props = {
  years: number[];
  logo?: any;
  teamId?: string | number;
  teamName?: string;
  league?: LeagueType;
};

export default function ChampionshipBanner({
  years,
  teamId,
  teamName,
  league = "NBA",
}: Props) {
  const isDark = useColorScheme() === "dark";

  // pick team array
  const teamList =
    league === "NFL"
      ? nflTeams
      : league === "CFB"
      ? cfbTeams
      : league === "CBB"
      ? cbbTeams
      : league === "MLB"
      ? mlbTeams
      : nbaTeams;

  // find team by id FIRST
  let team =
    teamList.find((t) => String(t.id) === String(teamId)) ||
    teamList.find((t) => t.name === teamName);

  if (!team) {
    console.warn(
      `ChampionshipBanner: No team found for id=${teamId}, name=${teamName}, league=${league}`
    );
  }

  // format years
  const isNone = years.length === 0;
  const isMany = years.length > 10;
  const bannerList = isNone ? [null] : isMany ? [years.length] : years;

function resolveTeamLogo(team: any, isDark: boolean, league: LeagueType) {
  if (!team) return undefined;

  // 1) If logo is a require() object → return directly
  if (typeof team.logo !== "string") {
    return isDark && team.logoLight ? team.logoLight : team.logo;
  }

  // 2) If logo is a URI string → wrap it
  return {
    uri: isDark && typeof team.logoLight === "string"
      ? team.logoLight
      : team.logo,
  };
}

  return (
    <View style={styles.wrapper}>
      {bannerList.map((yearVal, index) => {
        const yearShort = isNone
          ? "NONE"
          : isMany
          ? `x${yearVal}`
          : `'${String(yearVal).slice(-2)}`;

        let label = `${league} CHAMPIONS`;

        if (league === "CFB" && typeof yearVal === "number") {
          label = yearVal <= 2013 ? "BCS CHAMPIONS" : "CFP CHAMPIONS";
        }
        if (league === "MLB" && typeof yearVal === "number") {
          label = "WORLD SERIES CHAMPIONS";
        }

        return (
          <View key={index} style={styles.bannerWrapper}>
            {/* fill (tinted) */}
            <Image
              source={Fill}
              style={[
                styles.bannerFill,
                {
                  tintColor: team?.color ?? Colors.midTone,
                },
              ]}
              resizeMode="contain"
            />

            {/* outline */}
            <Image
              source={isDark ? OutlineLight : Outline}
              style={styles.bannerOutline}
              resizeMode="contain"
            />

            {/* content */}
            <View style={styles.contentOverlay}>
              <Text style={styles.leagueLabel}>{label}</Text>
              <Text style={styles.yearText}>{yearShort}</Text>

              {team && (
                <Image
                  source={resolveTeamLogo(team, isDark, league)}
                  style={styles.teamLogo}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginVertical: 16,
  },

  bannerWrapper: {
    width: 120,
    height: 165,
    alignItems: "center",
    justifyContent: "center",
  },

  bannerFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  bannerOutline: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  contentOverlay: {
    position: "absolute",
    top: 16,
    width: "100%",
    alignItems: "center",
  },

  yearText: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.OSBOLD,
    marginTop: 4,
  },

  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  leagueLabel: {
    color: Colors.white,
    fontSize: 12,
    width: 60,
    textAlign: "center",
    fontFamily: Fonts.OSBOLD,
  },
});
