// components/NBAStandingsList.tsx
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, globalStyles } from "constants/Styles";
import { getTeamByESPNId, nbaDivisionsById } from "constants/teams";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import { getTeamByESPNId as getNFLTeamByESPNId } from "constants/teamsNFL";
import { getNHLTeamByEspnId as getNHLTeamByESPNId } from "constants/teamsNHL";
import { useRouter } from "expo-router";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import {
  ConferenceStandings,
  StandingsTeam,
  useLeagueStandings,
} from "hooks/useLeagueStandings";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";
import { StatusBadge } from "./StatusBadge";
import { PlayoffLeague, StatusLegend } from "./StatusLegend";

type SectionType = {
  title: string;
  data: StandingsTeam[];
};

type Props = {
  year?: string;
  onYearChange?: (y: string) => void;
  league: PlayoffLeague;
};

export const standingLabels = [
  "W-L",
  "Streak",
  "Win %",
  "GB",
  "Home",
  "Away",
  "Conf",
  "Div",
  "Last Ten",
  "Pts For",
  "Pts Against",
  "PPG",
  "OPP PPG",
];

const columnKeyMap: Record<string, keyof StandingsTeam> = {
  "W-L": "wins",
  Streak: "streak",
  "Win %": "winPercent",
  GB: "gamesBehind",
  Home: "homeRecord",
  Away: "roadRecord",
  Conf: "vsConf",
  Div: "vsDiv",
  "Last Ten": "lastTen",
  "Pts For": "pointsFor",
  "Pts Against": "pointsAgainst",
  PPG: "avgPointsFor",
  "OPP PPG": "avgPointsAgainst",
};

const getActiveColumns = (data: StandingsTeam[]) => {
  return standingLabels.filter((label) =>
    data.some((team) => {
      const key = columnKeyMap[label];
      return team[key] !== null && team[key] !== undefined;
    }),
  );
};

type ConferenceInfo = {
  name: string;
  abbreviation: string;
};

type LeagueConferenceConfig = {
  [key in PlayoffLeague]: {
    conferences: Record<string, ConferenceInfo>;
  };
};
export const leagueConferences: LeagueConferenceConfig = {
  MLB: {
    conferences: {
      conferenceA: {
        name: "American League",
        abbreviation: "AL",
      },
      conferenceB: {
        name: "National League",
        abbreviation: "NL",
      },
      conferenceC: {
        name: "Cactus League",
        abbreviation: "Cactus",
      },
      conferenceD: {
        name: "Grapefruit League",
        abbreviation: "Grapefruit",
      },
    },
  },

  NFL: {
    conferences: {
      conferenceA: {
        name: "American Football Conference",
        abbreviation: "AFC",
      },
      conferenceB: {
        name: "National Football Conference",
        abbreviation: "NFC",
      },
    },
  },
  NBA: {
    conferences: {
      conferenceA: {
        name: "Eastern Conference",
        abbreviation: "East",
      },
      conferenceB: {
        name: "Western Conference",
        abbreviation: "West",
      },
    },
  },
  NHL: {
    conferences: {
      conferenceA: {
        name: "Eastern Conference",
        abbreviation: "East",
      },
      conferenceB: {
        name: "Western Conference",
        abbreviation: "West",
      },
    },
  },
};

export const StandingsList = ({ year, onYearChange, league }: Props) => {
  const {
    standings: conferences,
    loading,
    error,
  } = useLeagueStandings(league, year);
  const isDark = useColorScheme() === "dark";
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference",
  );
  const { isFavorite } = useFavoriteTeams();

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2000;

    const arr = [];
    for (let y = currentYear; y >= startYear; y--) {
      arr.push({ label: String(y), value: String(y) });
    }

    return arr;
  }, []);

  const safeYear =
    Number(year) > Number(yearOptions[0]?.value) ? yearOptions[0].value : year;

  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error) return <Text style={global.errorText}>{error}</Text>;

  // --- Group by division ---
  const divisions: Record<string, StandingsTeam[]> = {};
  conferences?.forEach((conf) => {
    conf.standings.forEach((team) => {
      if (!divisions[team.division]) divisions[team.division] = [];
      divisions[team.division].push(team);
    });
  });

  // --- Group by division using mapped list ---
  const divisionStandings: SectionType[] = Object.entries(nbaDivisionsById).map(
    ([divisionName, idList]) => {
      const teamsInDivision =
        conferences
          ?.flatMap((conf: ConferenceStandings) => conf.standings)
          .filter((team: StandingsTeam) =>
            idList.includes(Number(team.teamId)),
          ) || [];

      return {
        title: `${divisionName} Division`,
        data: teamsInDivision,
      };
    },
  );

  const renderLeftItem = ({
    item,
    index,
  }: {
    item: StandingsTeam;
    index: number;
  }) => {
    const team =
      league === "NBA"
        ? getTeamByESPNId(Number(item.teamId))
        : league === "NFL"
          ? getNFLTeamByESPNId(Number(item.teamId))
          : league === "MLB"
            ? getMLBTeamByEspnId(item.teamId)
            : getNHLTeamByESPNId(Number(item.teamId));
    const teamLogo = isDark ? team?.logoLight || team?.logo : team?.logo;
    const teamCode = team?.code;

    const favorited = team ? isFavorite(league, team.id) : false;

    return (
      <View
        style={[
          styles.row,
          favorited && {
            backgroundColor: isDark
              ? Colors.dark.itemBackground
              : Colors.light.itemBackground,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <TouchableOpacity
          style={styles.teamInfo}
          onPress={() =>
            router.push({
              pathname: "/team/[teamId]",
              params: { teamId: String(team?.id) },
            })
          }
        >
          <Image source={teamLogo} style={styles.logo} />
          <Text style={styles.teamName}>{teamCode}</Text>
          <StatusBadge code={item.clincher} league={league} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightItem =
    (activeColumns: string[]) =>
    ({ item }: { item: StandingsTeam }) => {
      const team =
        league === "NBA"
          ? getTeamByESPNId(Number(item.teamId))
          : league === "NFL"
            ? getNFLTeamByESPNId(Number(item.teamId))
            : league === "MLB"
              ? getMLBTeamByEspnId(Number(item.teamId))
              : getNHLTeamByESPNId(Number(item.teamId));

      const favorited = team ? isFavorite(league, team.id) : false;

      const winStreak = item.streak?.startsWith("W");
      const streakColor = winStreak
        ? isDark
          ? Colors.dark.limeGreen
          : Colors.light.green
        : isDark
          ? Colors.dark.lightRed
          : Colors.light.red;
      const formatNumber = (value: any) => {
        if (value === null || value === undefined) return value;

        const num = Number(value);
        if (isNaN(num)) return value;

        return num.toLocaleString("en-US");
      };

      return (
        <View
          style={[
            styles.row,
            favorited && {
              backgroundColor: isDark
                ? Colors.dark.itemBackground
                : Colors.light.itemBackground,
            },
          ]}
        >
          {activeColumns.map((label) => {
            const key = columnKeyMap[label];
            let value = item[key];

            if (label === "W-L") {
              value = `${item.wins ?? 0}-${item.losses ?? 0}`;
            }
            if (key === "winPercent" && value !== null && value !== undefined) {
              value = `${(Number(value) * 100).toFixed(1)}%`;
            }
            if (label === "PPG" && value !== null && value !== undefined) {
              value = `${Number(value).toFixed(1)}`;
            }
            if (label === "OPP PPG" && value !== null && value !== undefined) {
              value = `${Number(value).toFixed(1)}`;
            }

            // Add commas to large numbers
            const numericValue = Number(value);
            if (!isNaN(numericValue) && numericValue >= 1000) {
              value = numericValue.toLocaleString("en-US");
            }

            return (
              <View key={label} style={styles.statCell}>
                <Text
                  style={[
                    styles.statText,
                    key === "streak" ? { color: streakColor } : undefined,
                  ]}
                >
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      );
    };

  const renderHeader = () => (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#</Text>
      </View>
      <View>
        <Text style={styles.teamHeaderText}>Team</Text>
      </View>
    </View>
  );

  const renderStatsHeader = (activeColumns: string[]) => (
    <View style={styles.row}>
      {activeColumns.map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function Section({ title, data }: SectionType) {
    const activeColumns = getActiveColumns(data);

    return (
      <View style={{ marginTop: 20 }}>
        <HeadingTwo style={styles.header}>{title}</HeadingTwo>

        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.teamId}
            renderItem={renderLeftItem}
            scrollEnabled={false}
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ width: 220 }}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.teamId)}
              renderItem={renderRightItem(activeColumns)}
              scrollEnabled={false}
              ListHeaderComponent={() => renderStatsHeader(activeColumns)}
              stickyHeaderIndices={[0]}
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  const conferenceConfig = leagueConferences[league].conferences;

  return (
    <ScrollView>
      <View style={{ flexDirection: "row" }}>
        <Dropdown
          options={[
            { label: "Conference", value: "conference" },
            { label: "Division", value: "division" },
          ]}
          selectedValue={sortMode}
          onSelect={(value) => setSortMode(value as any)}
          isDark={isDark}
          absolute
          style={{ right: 100 }}
        />

        {onYearChange && (
          <Dropdown
            options={yearOptions}
            selectedValue={safeYear ?? ""}
            onSelect={onYearChange}
            isDark={isDark}
            absolute
            style={{ right: 0 }}
          />
        )}
      </View>
      {sortMode === "conference" ? (
        <>
          {Object.values(conferenceConfig).map((conf) => {
            const data =
              conferences?.find(
                (c) =>
                  c.abbreviation === conf.abbreviation || c.name === conf.name,
              )?.standings || [];

            // Don’t render empty sections
            if (!data.length) return null;

            return (
              <Section key={conf.abbreviation} title={conf.name} data={data} />
            );
          })}
        </>
      ) : (
        divisionStandings.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            data={section.data}
          />
        ))
      )}
      <StatusLegend league={league} />
    </ScrollView>
  );
};
