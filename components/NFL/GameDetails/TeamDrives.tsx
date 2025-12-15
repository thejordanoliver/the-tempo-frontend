import { getTeamLogo, teams as CFBTeams } from "constants/teamsCFB";
import { getNFLTeamsLogo, teams as NFLTeams } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LeagueType } from "types/types";
import HeadingTwo from "../../Headings/HeadingTwo";
import FixedWidthTabBar, { getLabelStyle } from "../../TabBars/FixedWidthTabBar";
import DrivesList, { Drive } from "./DrivesList";

type Props = {
  previousDrives?: Drive[] | null;
  currentDrives?: Drive[] | null;
  loading?: boolean;
  error?: string | null;
  awayTeamId?: number;     // ✅ Now team ID
  homeTeamId?: number;     // ✅ Now team ID
  lighter?: boolean;
  league?: LeagueType;
};

export default function TeamDrives({
  previousDrives = [],
  currentDrives = [],
  loading = false,
  error = null,
  awayTeamId,
  homeTeamId,
  lighter = false,
  league = "NFL",
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const prev = Array.isArray(previousDrives) ? previousDrives : [];
  const curr = Array.isArray(currentDrives) ? currentDrives : [];
  const allDrives = useMemo(() => [...curr, ...prev], [curr, prev]);

  // Pick correct constants list
  const TEAM_LIST = league === "CFB" ? CFBTeams : NFLTeams;

  // Convert internal team ID → internal team object
  const getTeamById = (id?: number | string | null) => {
    if (!id) return null;
    return TEAM_LIST.find((t) => Number(t.espnID) === Number(id)) ?? null;
  };

  const awayTeamObj = getTeamById(awayTeamId);
  const homeTeamObj = getTeamById(homeTeamId);

const teams = useMemo(() => {
  const tabs: { id: string; code: string }[] = [{ id: "ALL", code: "ALL" }];

  if (awayTeamObj) {
    tabs.push({
      id: String(awayTeamObj.espnID),   // <-- ESPN ID
      code: awayTeamObj.code ?? String(awayTeamObj.espnID),
    });
  }

  if (homeTeamObj && homeTeamObj.espnID !== awayTeamObj?.espnID) {
    tabs.push({
      id: String(homeTeamObj.espnID),   // <-- ESPN ID
      code: homeTeamObj.code ?? String(homeTeamObj.espnID),
    });
  }

  const uniqueEspnIds = Array.from(
    new Set(allDrives.map((d) => String(d?.team?.id)).filter(Boolean))
  );

  uniqueEspnIds.forEach((espnID) => {
    const t = getTeamById(espnID);
    if (t && !tabs.find((tab) => tab.id === String(t.espnID))) {
      tabs.push({
        id: String(t.espnID),           // <-- ESPN ID
        code: t.code ?? String(t.espnID),
      });
    }
  });

  return tabs;
}, [allDrives, awayTeamObj, homeTeamObj]);

  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id ?? "ALL");

  useEffect(() => {
    if (!teams.find((t) => t.id === selectedTeam)) {
      setSelectedTeam(teams[0]?.id ?? "ALL");
    }
  }, [teams, selectedTeam]);

  // ⭐ Filter drives by team ID
  const teamDrives = useMemo(() => {
    if (selectedTeam === "ALL") return allDrives;

    return allDrives.filter((d) => String(d?.team?.id) === selectedTeam);
  }, [allDrives, selectedTeam]);

  if (!loading && allDrives.length === 0) return null;

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Drives</HeadingTwo>

      <FixedWidthTabBar
        tabs={teams.map((t) => t.id)}  // IDs are tabs
        selected={selectedTeam}
        onTabPress={setSelectedTeam}
        lighter={lighter}
        renderLabel={(id, isSelected) => {
          const tabTeam = teams.find((t) => t.id === id);
          const code = tabTeam?.code ?? "ALL";
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
                  style={[styles.logo, { opacity: isSelected ? 1 : 0.5 }]}
                  resizeMode="contain"
                />
              )}
              <Text
                style={getLabelStyle(isDark, isSelected, lighter, {
                  opacity: isSelected ? 1 : 0.5,
                })}
              >
                {code}
              </Text>
            </View>
          );
        }}
      />

      <DrivesList
        previousDrives={[]}
        currentDrives={teamDrives}
        loading={loading}
        error={error}
        lighter={lighter}
        league={league}
      />
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
    },
  });
