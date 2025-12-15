import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";

import Fill from "assets/banners/Fill.png";
import Outline from "assets/banners/Outline.png";
import OutlineLight from "assets/banners/OutlineLight.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { LeagueType } from "types/types";
import { teams as nbaTeams } from "../../constants/teams";
import { teams as cbbTeams } from "../../constants/teamsCBB";
import { teams as cfbTeams } from "../../constants/teamsCFB";
import { teams as mlbTeams } from "../../constants/teamsMLB";
import { teams as nflTeams } from "../../constants/teamsNFL";

type Props = {
  years?: number[];
  currentYear?: number;
  logo?: any;
  teamId?: string | number;
  teamName?: string;
  league?: LeagueType;
};

function isColorDark(hex: string | undefined): boolean {
  if (!hex) return false; // default to light

  const cleaned = hex.replace("#", "");

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  // Perceived luminance formula
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance < 140; // threshold for "dark"
}

export default function ChampionshipBanner({
  years,
  currentYear,
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

  const baseYears = Array.isArray(years) ? years : [];
  let safeYears = [...baseYears];

  // If currentYear exists and isn't already included, add it at the front
  if (currentYear && !safeYears.includes(currentYear)) {
    safeYears = [currentYear, ...safeYears];
  }

  // format years using safeYears
  const isNone = safeYears.length === 0;
  const isMany = safeYears.length > 10;
  const bannerList = isNone ? [null] : isMany ? [safeYears.length] : safeYears;

  function resolveTeamLogo(team: any) {
    if (!team) return undefined;

    // Always prefer logoLight if available
    const rawLogo = team.logoLight || team.logo;

    if (!rawLogo) return undefined;

    // require() asset (non-string)
    if (typeof rawLogo !== "string") {
      return rawLogo;
    }

    return { uri: rawLogo };
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
        if (league === "NFL" && typeof yearVal === "number") {
          label = "SUPER BOWL CHAMPIONS";
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
              source={
                isColorDark(team?.color) // team color dark?
                  ? OutlineLight // use LIGHT outline
                  : Outline // use DARK outline
              }
              style={styles.bannerOutline}
              resizeMode="contain"
            />

            {/* content */}
            <View style={styles.contentOverlay}>
              <Text style={styles.leagueLabel}>{label}</Text>
              <Text style={styles.yearText}>{yearShort}</Text>

              <Image
                source={resolveTeamLogo(team) || PlaceholderLogo}
                style={styles.teamLogo}
              />
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
    width: 40,
    height: 40,
    marginTop: 8,
    resizeMode: "contain",
  },
  leagueLabel: {
    color: Colors.white,
    fontSize: 12,
    width: 100,
    textAlign: "center",
    fontFamily: Fonts.OSBOLD,
  },
});
