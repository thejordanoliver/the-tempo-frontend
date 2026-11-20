import { ChampionshipBannerStyles } from "@/styles/TeamStyles/ChampionshipBannerStyles";
import type { Championships } from "@/types/team";
import Fill from "assets/banners/Fill.png";
import Outline from "assets/banners/Outline.png";
import OutlineLight from "assets/banners/OutlineLight.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors } from "constants/styles";
import { Image, Text, View } from "react-native";

type Props = {
  championships: Championships[] | undefined;
  teamId?: string | number;
  teamName?: string;
  teamColor?: string;
  teamLogo?: any;
  league?: string;
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

export default function ChampionshipBanner({
  championships,
  teamId,
  teamName,
  teamColor,
  teamLogo,
  league = "nba",
}: Props) {
  const styles = ChampionshipBannerStyles;

  if (!teamId) {
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
            league === "nfl"
              ? championship.notes || championship.season
              : championship.season,
          isCount: false,
        }));

  return (
    <View style={styles.wrapper}>
      {bannerList.map(({ season, displayValue, isCount }, index) => {
        const year = isNone
          ? "NONE"
          : isCount
            ? `x${displayValue}`
            : league === "nfl"
              ? String(displayValue)
              : displayValue;

        let label = `${league.toUpperCase()} CHAMPIONS`;

        if (league === "cfb" && !isCount && season != null) {
          const numericYear = Number(season);

          if (!Number.isNaN(numericYear)) {
            label = numericYear <= 2013 ? "BCS CHAMPIONS" : "CFP CHAMPIONS";
          }
        }

        if (league === "mlb") {
          label = "WORLD SERIES CHAMPIONS";
        }

        if (league === "nfl") {
          label = "SUPER BOWL CHAMPIONS";
        }

        if (league === "nhl") {
          label = "STANLEY CUP CHAMPIONS";
        }

        if (league === "wnba") {
          label = "WNBA CHAMPIONS";
        }
        if (["cb", "sb", "mcbb", "wcbb"].includes(league)) {
          label = "NATIONAL CHAMPIONS";
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
                { tintColor: teamColor ?? Colors.midTone },
              ]}
              resizeMode="contain"
            />

            <Image
              source={isColorDark(teamColor ?? "") ? OutlineLight : Outline}
              style={styles.bannerOutline}
              resizeMode="contain"
            />

            <View style={styles.contentOverlay}>
              <Text style={styles.leagueLabel}>{label}</Text>
              <Text style={styles.yearText}>{year}</Text>

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
