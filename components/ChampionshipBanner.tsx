import {
  Image,
  ImageBackground,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { logoMap as nbaLogoMap, teams as nbaTeams } from "../constants/teams";
import {
  logoMap as nflLogoMap,
  teams as nflTeams,
} from "../constants/teamsNFL";

import { Fonts } from "constants/fonts";
import { LeagueType } from "types/types";
import {
  logoMap as cfbLogoMap,
  teams as cfbTeams,
} from "../constants/teamsCFB";

type Props = {
  years: number[];
  logo?: any;
  teamId?: string | number;
  teamName?: string;
  league?: LeagueType;
};

export default function ChampionshipBanner({
  years,
  logo,
  teamId,
  teamName,
  league = "NBA",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const cleanName = teamName?.replace(/"/g, "") || "";

  const teams =
    league === "NFL" ? nflTeams : league === "CFB" ? cfbTeams : nbaTeams;
  const logoMap =
    league === "NFL" ? nflLogoMap : league === "CFB" ? cfbLogoMap : nbaLogoMap;

  const team =
    teams.find((t) => String(t.id) === String(teamId)) ||
    teams.find((t) => t.name === cleanName);

  if (!team) {
    console.warn(
      `ChampionshipBanner: No team found for ID "${teamId}" or name "${teamName}" (${league})`
    );
  }

  const isNone = years.length === 0;
  const isManyYears = years.length > 10;
  const banners = isNone ? [null] : isManyYears ? [years.length] : years;
  const textColor = "#fff";

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        marginVertical: 16,
      }}
    >
      {banners.map((yearVal, index) => {
        const yearShort = isNone
          ? "NONE"
          : isManyYears
          ? league === "CFB"
            ? `x${yearVal}` // Show "xN" even for CFB
            : `x${yearVal}`
          : `'${yearVal?.toString().slice(-2)}`;

        const bannerSource = getBannerImage(team?.id, league, isDark);
        let championshipLabel = `${league} CHAMPIONS`;

        // For CFB, handle year vs. many championships
        if (league === "CFB") {
          if (isManyYears) {
            championshipLabel = "CFB CHAMPIONS"; // show generic label for >10 championships
          } else if (typeof yearVal === "number") {
            championshipLabel =
              yearVal <= 2013 ? "BCS CHAMPIONS" : "CFP CHAMPIONS";
          }
        }
        return (
          <ImageBackground
            key={index}
            source={bannerSource}
            style={{
              width: 120,
              height: 165,
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: 16,
            }}
            resizeMode="contain"
          >
            <Text
              style={{
                color: textColor,
                fontSize: 22,
                fontFamily: Fonts.OSBOLD,
              }}
            >
              {yearShort}
            </Text>

            {team && (
              <Image
                source={
                  getTeamLogoFromMap(team.name, logoMap, isDark, league) ||
                  team.logo ||
                  logo
                }
                style={{
                  width: 40,
                  height: 60,
                  marginTop: 4,
                  resizeMode: "contain",
                }}
              />
            )}

            <Text
              style={{
                color: textColor,
                fontSize: 12,
                fontFamily: Fonts.OSBOLD,
                marginTop: 0,
              }}
            >
              {championshipLabel}
            </Text>
          </ImageBackground>
        );
      })}
    </View>
  );
}

function getTeamLogoFromMap(
  name?: string,
  logoMap?: Record<string, any>,
  isDark?: boolean,
  league?: LeagueType
) {
  if (!name || !logoMap) return null;

  const cleanName = name.replace(/\s+/g, "");

  // For CFB, always use logoLight if available
  if (league === "CFB" && logoMap[`${cleanName}LogoLight`]) {
    return logoMap[`${cleanName}LogoLight`];
  }

  const logoKey = `${cleanName}Logo`;
  const logoLightKey = `${cleanName}LogoLight`;

  // Teams that should always use light logo in NBA
  const alwaysLightTeams = ["Jazz", "Rockets", "Sixers"];
  const isAlwaysLight = alwaysLightTeams.includes(cleanName);

  if ((isAlwaysLight || isDark) && logoMap[logoLightKey]) {
    return logoMap[logoLightKey];
  }

  return logoMap[logoKey] ?? null;
}

// --- BANNER MAPS ---

const nbaBannerMap: Record<string, any> = {
  "1": require("../assets/banners/HAWKS.png"),
  "2": require("../assets/banners/CELTICS.png"),
  "4": require("../assets/banners/NETS.png"),
  "5": require("../assets/banners/HORNETS.png"),
  "6": require("../assets/banners/BULLS.png"),
  "7": require("../assets/banners/CAVS.png"),
  "8": require("../assets/banners/MAVS.png"),
  "9": require("../assets/banners/NUGGETS.png"),
  "10": require("../assets/banners/PISTONS.png"),
  "11": require("../assets/banners/WARRIORS.png"),
  "14": require("../assets/banners/ROCKETS.png"),
  "15": require("../assets/banners/PACERS.png"),
  "16": require("../assets/banners/CLIPPERS.png"),
  "17": require("../assets/banners/LAKERS.png"),
  "19": require("../assets/banners/GRIZZLIES.png"),
  "20": require("../assets/banners/HEAT.png"),
  "21": require("../assets/banners/BUCKS.png"),
  "22": require("../assets/banners/TIMBERWOLVES.png"),
  "23": require("../assets/banners/PELICANS.png"),
  "24": require("../assets/banners/KNICKS.png"),
  "25": require("../assets/banners/THUNDER.png"),
  "26": require("../assets/banners/MAGIC.png"),
  "27": require("../assets/banners/76ERS.png"),
  "28": require("../assets/banners/SUNS.png"),
  "29": require("../assets/banners/TRAILBLAZERS.png"),
  "30": require("../assets/banners/KINGS.png"),
  "31": require("../assets/banners/SPURS.png"),
  "38": require("../assets/banners/RAPTORS.png"),
  "40": require("../assets/banners/JAZZ.png"),
  "41": require("../assets/banners/WIZARDS.png"),
};

const nflBannerMap: Record<string, any> = {
  "1": require("../assets/bannersNFL/RAIDERS.png"),
  "2": require("../assets/bannersNFL/JAGUARS.png"),
  "3": require("../assets/bannersNFL/PATRIOTS.png"),
  "4": require("../assets/bannersNFL/GIANTS.png"),
  "5": require("../assets/bannersNFL/RAVENS.png"),
  "6": require("../assets/bannersNFL/TITANS.png"),
  "7": require("../assets/bannersNFL/LIONS.png"),
  "8": require("../assets/bannersNFL/FALCONS.png"),
  "9": require("../assets/bannersNFL/BROWNS.png"),
  "10": require("../assets/bannersNFL/BENGALS.png"),
  "11": require("../assets/bannersNFL/CARDINALS.png"),
  "12": require("../assets/bannersNFL/EAGLES.png"),
  "13": require("../assets/bannersNFL/JETS.png"),
  "14": require("../assets/bannersNFL/NINERS.png"),
  "15": require("../assets/bannersNFL/PACKERS.png"),
  "16": require("../assets/bannersNFL/BEARS.png"),
  "17": require("../assets/bannersNFL/CHIEFS.png"),
  "18": require("../assets/bannersNFL/COMMANDERS.png"),
  "19": require("../assets/bannersNFL/PANTHERS.png"),
  "20": require("../assets/bannersNFL/BILLS.png"),
  "21": require("../assets/bannersNFL/COLTS.png"),
  "22": require("../assets/bannersNFL/STEELERS.png"),
  "23": require("../assets/bannersNFL/SEAHAWKS.png"),
  "24": require("../assets/bannersNFL/BUCCANEERS.png"),
  "25": require("../assets/bannersNFL/DOLPHINS.png"),
  "26": require("../assets/bannersNFL/TEXANS.png"),
  "27": require("../assets/bannersNFL/SAINTS.png"),
  "28": require("../assets/bannersNFL/BRONCOS.png"),
  "29": require("../assets/bannersNFL/COWBOYS.png"),
  "30": require("../assets/bannersNFL/CHARGERS.png"),
  "31": require("../assets/bannersNFL/RAMS.png"),
  "32": require("../assets/bannersNFL/VIKINGS.png"),
};

const cfbBannerMap: Record<string, any> = {
  "113": require("../assets/bannersCFB/FLORIDA.png"),
  "107": require("../assets/bannersCFB/OHIOSTATE.png"),
  "195": require("../assets/bannersCFB/TEXAS.png"),
  "71": require("../assets/bannersCFB/UCF.png"),
  "106": require("../assets/bannersCFB/ALABAMA.png"),
};

function getBannerImage(
  teamId?: string | number,
  league: LeagueType = "NBA",
  isDark?: boolean
) {
  const fallback =
    league === "NFL"
      ? require("../assets/bannersNFL/DEFAULT.png")
      : league === "NBA"
      ? require("../assets/banners/DEFAULT.png")
      : require("../assets/bannersCFB/DEFAULT.png");

  if (!teamId) return fallback;

  const id = String(teamId);

  const maps =
    league === "NFL"
      ? nflBannerMap
      : league === "NBA"
      ? nbaBannerMap
      : cfbBannerMap;

  if (maps[id]) {
    return maps[id];
  }

  console.warn(`Banner not found for ${league} team ID:`, id);
  return fallback;
}
