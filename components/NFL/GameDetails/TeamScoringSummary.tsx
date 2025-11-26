import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCFB";
import { getNFLTeamsLogo } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../../Headings/HeadingTwo";
import FixedWidthTabBar, {
  getLabelStyle,
} from "../../TabBars/FixedWidthTabBar";
type ScoringPlay = {
  type?: { text?: string };
  team?: { abbreviation?: string };
  period?: { number?: number };
  clock?: { displayValue?: string };
  text?: string; // ESPN detailed description
  awayScore: number;
  homeScore: number;
};

type Props = {
  scoringPlays?: ScoringPlay[] | null;
  loading?: boolean;
  awayTeamAbbr?: string;
  homeTeamAbbr?: string;
  lighter?: boolean;
  league?: LeagueType;
};

export default function TeamScoringSummary({
  scoringPlays = [],
  loading = false,
  awayTeamAbbr,
  homeTeamAbbr,
  lighter = false,
  league = "NFL",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const periodMap: Record<string, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    OT: "OT",
    OVERTIME: "OT",
  };

  // 🧠 Unique list of scoring-play teams only
  const teams = useMemo(() => {
    const unique = Array.from(
      new Set(scoringPlays?.map((sp) => sp?.team?.abbreviation).filter(Boolean))
    );

    const tabs: string[] = [];

    const away = awayTeamAbbr?.toUpperCase();
    const home = homeTeamAbbr?.toUpperCase();

    // ✅ Always include away team first
    if (away) tabs.push(away);

    // ✅ Always include home team second (if different)
    if (home && home !== away) tabs.push(home);

    // ✅ Now add any scoring-play teams not already included
    unique
      .filter((t): t is string => typeof t === "string")
      .forEach((t) => {
        if (!tabs.includes(t)) tabs.push(t);
      });

    return tabs;
  }, [scoringPlays, awayTeamAbbr, homeTeamAbbr]);

  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0] ?? "");

  useEffect(() => {
    if (!selectedTeam || !teams.includes(selectedTeam)) {
      setSelectedTeam(teams[0] ?? "");
    }
  }, [teams]);

  // 🧠 All scoring plays for selected team
  const teamPlays = useMemo(
    () => scoringPlays?.filter((sp) => sp?.team?.abbreviation === selectedTeam),
    [scoringPlays, selectedTeam]
  );

  if (!loading && scoringPlays?.length === 0) return null;

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Scoring Summary</HeadingTwo>

      <FixedWidthTabBar
        tabs={teams}
        selected={selectedTeam}
        onTabPress={setSelectedTeam}
        awayTeamAbbr={awayTeamAbbr}
        homeTeamAbbr={homeTeamAbbr}
        lighter={lighter}
        renderLabel={(abbr, isSelected) => {
          const useLightLogo = lighter || isDark;
          const safeAbbr = abbr ?? "";

          const logo =
            league === "CFB"
              ? getTeamLogo(safeAbbr, useLightLogo)
              : getNFLTeamsLogo(safeAbbr, useLightLogo);

          return (
            <View style={styles.tabLabel}>
              {logo && (
                <Image
                  source={logo}
                  style={[styles.logo, { opacity: isSelected ? 1 : 0.6 }]}
                  resizeMode="contain"
                />
              )}
              <Text
                style={getLabelStyle(isDark, isSelected, lighter, {
                  opacity: isSelected ? 1 : 0.6,
                })}
              >
                {safeAbbr} {/* 👈 FIXED LINE */}
              </Text>
            </View>
          );
        }}
      />

      {/* 🏈 Scoring Summary List */}
      <View style={styles.listContainer}>
        {teamPlays?.map((play, index) => (
          <View key={index} style={styles.playRow}>
            <Text style={styles.periodText}>
              {periodMap[String(play.period?.number)] ?? "-"}
              <Text style={styles.clockText}>
                {" "}
                {play.clock?.displayValue ?? ""}
              </Text>
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.playDesc}>{play.text}</Text>
            </View>

            <Text style={styles.clockText}>
              {play.awayScore ?? ""}-{play.homeScore}
            </Text>
          </View>
        ))}

        {teamPlays?.length === 0 && (
          <Text style={styles.empty}>No scoring plays</Text>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: 10 },
    tabLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
    logo: { width: 26, height: 26 },
    listContainer: { marginTop: 12, gap: 12 },
    playRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.midTone,
    },
    periodText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 60,
    },
    playDesc: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 1,
    },
    clockText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      width: 45,
      textAlign: "right",
    },
    empty: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
