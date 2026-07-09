import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { PlayObject } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Colors, globalStyles } from "constants/styles";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";
import DrivesList from "./DrivesList";

type League = "nfl" | "cfb" | string;

type Props = {
  previousDrives?: PlayObject[] | null;
  currentDrives?: PlayObject[] | null;
  loading?: boolean;
  error?: string | null;
  awayLogo: any;
  homeLogo: any;
  awayCode: string;
  homeCode: string;
  homeId: number;
  awayId: number;
  isDark: boolean;
  league?: League;
  state?: string;
};

const normalizeId = (id?: number | string | null): string | null => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  return String(id);
};

export default function TeamDrives({
  previousDrives = [],
  currentDrives = [],
  loading = false,
  error = null,
  awayId,
  homeId,
  awayLogo,
  homeLogo,
  awayCode,
  homeCode,
  isDark,
  league = "nfl",
  state,
}: Props) {
  const styles = TeamDrivesStyles(isDark);
  const global = globalStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("away");

  const previous = useMemo(() => {
    return Array.isArray(previousDrives) ? previousDrives : [];
  }, [previousDrives]);

  const current = useMemo(() => {
    return Array.isArray(currentDrives) ? currentDrives : [];
  }, [currentDrives]);

  const allDrives = useMemo(() => {
    return [...current, ...previous];
  }, [current, previous]);

  const teams = useMemo(
    () => ({
      away: {
        key: "away" as const,
        id: normalizeId(awayId),
        label: awayCode?.trim() || "Away",
        logo: awayLogo,
      },
      home: {
        key: "home" as const,
        id: normalizeId(homeId),
        label: homeCode?.trim() || "Home",
        logo: homeLogo,
      },
    }),
    [awayCode, awayId, awayLogo, homeCode, homeId, homeLogo],
  );

  const selectedTeam = teams[selectedTab];

  const selectedCurrentDrives = useMemo(() => {
    if (!selectedTeam.id) {
      return [];
    }

    return current.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return driveTeamId === selectedTeam.id;
    });
  }, [current, selectedTeam.id]);

  const selectedPreviousDrives = useMemo(() => {
    if (!selectedTeam.id) {
      return [];
    }

    return previous.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return driveTeamId === selectedTeam.id;
    });
  }, [previous, selectedTeam.id]);

  if (state !== "post" && state !== "in") {
    return null;
  }

  if (!loading && allDrives.length === 0) {
    return (
      <View>
        <HeadingTwo isDark={isDark}>Scoring Summary</HeadingTwo>
        <View style={styles.wrapper}>
          <HomeAwayTabBar
            awayTeam={{
              id: awayId,
              name: awayCode?.trim() || "Away",

              logo: awayLogo,
            }}
            homeTeam={{
              id: homeId,
              name: homeCode?.trim() || "Home",

              logo: homeLogo,
            }}
            selected={selectedTab}
            onTabPress={setSelectedTab}
            isDark={isDark}
          />

          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>No drives found for this team.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <HeadingTwo isDark={isDark}>Drives</HeadingTwo>

      <View style={styles.wrapper}>
        <HomeAwayTabBar
          awayTeam={{
            id: awayId,
            name: awayCode || "AWAY",
            logo: awayLogo,
          }}
          homeTeam={{
            id: homeId,
            name: homeCode || "HOME",
            logo: homeLogo,
          }}
          selected={selectedTab}
          onTabPress={setSelectedTab}
          isDark={isDark}
        />

        <DrivesList
          previousDrives={selectedPreviousDrives}
          currentDrives={selectedCurrentDrives}
          loading={loading}
          error={error}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}

const TeamDrivesStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
  });
