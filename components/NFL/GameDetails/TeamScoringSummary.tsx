import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo, teams as CFBTeams } from "constants/teamsCFB";
import { getNFLTeamsLogo, teams as NFLTeams } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../../Headings/HeadingTwo";
import FixedWidthTabBar, { getLabelStyle } from "../../TabBars/FixedWidthTabBar";

type ScoringPlay = {
  type?: { text?: string };
  team?: { abbreviation?: string; id?: number };
  period?: { number?: number };
  clock?: { displayValue?: string };
  text?: string;
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

  // Pick correct constants list
  const TEAM_LIST = league === "CFB" ? CFBTeams : NFLTeams;

  // Convert ESPN ID → internal code
  const getCode = (espnID?: number | string | null): string | null => {
    if (!espnID) return null;
    return (
      TEAM_LIST.find((t) => Number(t.espnID) === Number(espnID))?.code ?? null
    );
  };

  const awayCode = getCode(awayTeamAbbr);
  const homeCode = getCode(homeTeamAbbr);

  // 🧠 Build tabs from ESPN IDs, not ESPN abbreviations
  const teams = useMemo(() => {
    const tabs: string[] = ["ALL"];

    if (awayCode) tabs.push(awayCode);
    if (homeCode && homeCode !== awayCode) tabs.push(homeCode);

    const uniqueCodes = Array.from(
      new Set(
        scoringPlays
          ?.map((sp) => getCode(sp.team?.id))
          .filter((c): c is string => !!c)
      )
    );

    uniqueCodes.forEach((code) => {
      if (!tabs.includes(code)) {
        tabs.push(code);
      }
    });

    return tabs;
  }, [scoringPlays, awayCode, homeCode]);

  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0] ?? "");

  useEffect(() => {
    if (!teams.includes(selectedTeam)) {
      setSelectedTeam(teams[0] ?? "");
    }
  }, [teams, selectedTeam]);

  // 🧠 Filter by ESPN ID → internal code
  const teamPlays = useMemo(() => {
    if (selectedTeam === "ALL") return scoringPlays;

    return scoringPlays?.filter(
      (sp) => getCode(sp.team?.id) === selectedTeam
    );
  }, [scoringPlays, selectedTeam]);

  if (!loading && scoringPlays?.length === 0) return null;

  const periodMap: Record<string, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    OT: "OT",
    OVERTIME: "OT",
  };

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Scoring Summary</HeadingTwo>

      <FixedWidthTabBar
        tabs={teams}
        selected={selectedTeam}
        onTabPress={setSelectedTeam}
        lighter={lighter}
        renderLabel={(code, isSelected) => {
          const useLightLogo = lighter || isDark;

          const logo =
            code === "ALL"
              ? null
              : league === "CFB"
              ? getTeamLogo(code, useLightLogo)
              : getNFLTeamsLogo(code, useLightLogo);

          return (
            <View style={styles.tabLabel}>
              {logo && (
                <Image
                  source={logo}
                  style={[styles.logo, { opacity: isSelected ? 1 : 0.6 }]}
                  resizeMode={"contain"}
                />
              )}
              <Text
                style={getLabelStyle(isDark, isSelected, lighter, {
                  opacity: isSelected ? 1 : 0.6,
                })}
              >
                {code === "ALL" ? "ALL" : code}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.listContainer}>
        {teamPlays?.map((play, index) => (
          <View key={index} style={styles.playRow}>
            <Text style={styles.periodText}>
              {periodMap[String(play.period?.number)] ?? "-"}
              <Text style={styles.clockText}>
                {" "}{play.clock?.displayValue ?? ""}
              </Text>
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.playDesc}>{play.text}</Text>
            </View>

            <Text style={styles.clockText}>
              {play.awayScore}-{play.homeScore}
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
      borderBottomWidth: StyleSheet.hairlineWidth,
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
