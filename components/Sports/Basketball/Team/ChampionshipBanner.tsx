import { Championships } from "@/hooks/useTeams";
import Fill from "assets/banners/Fill.png";
import Outline from "assets/banners/Outline.png";
import OutlineLight from "assets/banners/OutlineLight.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors, Fonts } from "constants/styles";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { getWNBATeam } from "constants/teamsWNBA";
import { Image, StyleSheet, Text, View } from "react-native";
import { LeagueType } from "types/types";

type Props = {
  isDark: boolean;
  championships: Championships[] | undefined;
  logo?: any;
  teamId?: string | number;
  teamName?: string;
  teamLogo?: any;
  league?: LeagueType;
};

function isColorDark(hex: string | undefined): boolean {
  if (!hex) return false;

  const cleaned = hex.replace("#", "");

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance < 140;
}

function getTeamByLeague(league: LeagueType, teamId?: string | number) {
  if (!teamId) return undefined;

  switch (league) {
    case "NFL":
      return getNFLTeam(teamId);

    case "CFB":
      return getCFBTeam(teamId);

    case "CBB":
      return getCBBTeam(teamId);
    case "WCBB":
      return getCBBTeam(teamId, true);

    case "MLB":
      return getMLBTeam(teamId);

    case "NHL":
      return getNHLTeam(teamId);

    case "WNBA":
      return getWNBATeam(teamId);

    default:
      return getNBATeam(teamId);
  }
}

export default function ChampionshipBanner({
  isDark,
  championships,
  teamId,
  teamName,
  teamLogo,
  league = "NBA",
}: Props) {
  const team = getTeamByLeague(league, teamId);
  const styles = championshipBannerStyles(isDark);

  if (!team) {
    console.warn(
      `ChampionshipBanner: No team found for id=${teamId}, name=${teamName}, league=${league}`,
    );
  }

  const championshipList = championships ?? [];
  const isNone = championshipList.length === 0;
  const isMany = championshipList.length > 10;

  const bannerList = isNone
    ? [{ season: null, displayValue: null, isCount: false }]
    : isMany
      ? [
          {
            season: null,
            displayValue: championshipList.length,
            isCount: true,
          },
        ]
      : championshipList.map((championship) => ({
          season: championship.season,
          displayValue:
            league === "NFL"
              ? championship.notes || championship.season
              : championship.season,
          isCount: false,
        }));

  return (
    <View style={styles.wrapper}>
      {bannerList.map(({ season, displayValue, isCount }, index) => {
        const yearShort = isNone
          ? "NONE"
          : isCount
            ? `x${displayValue}`
            : league === "NFL"
              ? String(displayValue)
              : typeof displayValue === "number" ||
                  !Number.isNaN(Number(displayValue))
                ? `'${String(displayValue).slice(-2)}`
                : String(displayValue);

        let label = `${league} CHAMPIONS`;

        if (league === "CFB" && !isCount && season != null) {
          const numericYear = Number(season);

          if (!Number.isNaN(numericYear)) {
            label = numericYear <= 2013 ? "BCS CHAMPIONS" : "CFP CHAMPIONS";
          }
        }

        if (league === "MLB") {
          label = "WORLD SERIES CHAMPIONS";
        }

        if (league === "NFL") {
          label = "SUPER BOWL CHAMPIONS";
        }

        if (league === "NHL") {
          label = "STANLEY CUP CHAMPIONS";
        }

        if (league === "WNBA") {
          label = "WNBA CHAMPIONS";
        }

        return (
          <View
            key={`${season ?? displayValue ?? "none"}-${index}`}
            style={styles.bannerWrapper}
          >
            <Image
              source={Fill}
              style={[
                styles.bannerFill,
                { tintColor: team?.color ?? Colors.midTone },
              ]}
              resizeMode="contain"
            />

            <Image
              source={isColorDark(team?.color ?? "") ? OutlineLight : Outline}
              style={styles.bannerOutline}
              resizeMode="contain"
            />

            <View style={styles.contentOverlay}>
              <Text style={styles.leagueLabel}>{label}</Text>
              <Text style={styles.yearText}>{yearShort}</Text>

              <Image
                source={teamLogo || PlaceholderLogo}
                style={styles.teamLogo}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const championshipBannerStyles = (isDark: boolean) =>
  StyleSheet.create({
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
