import HomeAwayTabBar, {
  HomeAwayTabValue,
} from "@/components/TabBars/HomeAwayTabBar";
import { PlayObject } from "@/hooks/FootballHooks/useFootballGameDetails";
import { Colors } from "constants/styles";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import HeadingTwo from "../../../Headings/HeadingTwo";
import DrivesList from "./DrivesList";

type League = "NFL" | "CFB" | string;

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
  league = "NFL",
  state,
}: Props) {
  const styles = TeamDrivesStyles(isDark);

  const [selectedTab, setSelectedTab] = useState<HomeAwayTabValue>("all");

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
        id: normalizeId(awayId),
        label: awayCode || "Away",
        logo: awayLogo,
      },
      home: {
        id: normalizeId(homeId),
        label: homeCode || "Home",
        logo: homeLogo,
      },
    }),
    [awayCode, awayId, awayLogo, homeCode, homeId, homeLogo],
  );

  const selectedCurrentDrives = useMemo(() => {
    if (selectedTab === "all") {
      return current;
    }

    const selectedTeam = teams[selectedTab];

    if (!selectedTeam.id) {
      return [];
    }

    return current.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return driveTeamId === selectedTeam.id;
    });
  }, [current, selectedTab, teams]);

  const selectedPreviousDrives = useMemo(() => {
    if (selectedTab === "all") {
      return previous;
    }

    const selectedTeam = teams[selectedTab];

    if (!selectedTeam.id) {
      return [];
    }

    return previous.filter((drive) => {
      const driveTeamId = normalizeId(drive.team?.id);

      return driveTeamId === selectedTeam.id;
    });
  }, [previous, selectedTab, teams]);

  if (state !== "post" && state !== "in") {
    return null;
  }

  if (!loading && allDrives.length === 0) {
    return null;
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
          showAllTab
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
