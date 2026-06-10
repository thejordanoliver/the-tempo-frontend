// components/NBAStandingsList.tsx
import { getUFLTeam } from "@/constants/teamsUFL";
import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getTeamByESPNId, nbaDivisionsById } from "constants/teams";
import { getMLBTeamByEspnId } from "constants/teamsMLB";
import { getTeamByESPNId as getNFLTeamByESPNId } from "constants/teamsNFL";
import { getNHLTeamByEspnId as getNHLTeamByESPNId } from "constants/teamsNHL";
import { getWNBATeamByESPNId } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import {
  ConferenceStandings,
  StandingsTeam,
  useLeagueStandings,
} from "hooks/LeagueHooks/useLeagueStandings";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";
import { StatusBadge } from "./StatusBadge";
import { PlayoffLeague, StatusLegend } from "./StatusLegend";

type SectionType = {
  title: string;
  data: StandingsTeam[];
  isFirst?: boolean;
  isDivision?: boolean;
  isLast?: boolean; // new
};

type Props = {
  year?: string;
  onYearChange?: (y: string) => void;
  league: PlayoffLeague;
  isGameDetailScreen?: boolean;
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

  UFL: {
    conferences: {
      conferenceA: {
        name: "United Football League",
        abbreviation: "UFL",
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
  WNBA: {
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

export const StandingsList = ({
  year,
  onYearChange,
  league,
  isGameDetailScreen,
}: Props) => {
  const {
    standings: conferences,
    regularSeasonOptions,
    loading,
    error,
  } = useLeagueStandings(league, year);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();

  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference",
  );

  const { isFavorite } = useFavoriteTeamsContext();

  const yearOptions = regularSeasonOptions;

  const safeYear = useMemo(() => {
    if (!yearOptions.length) return year ?? "";

    const selectedExists = yearOptions.some((option) => option.value === year);

    return selectedExists ? year : yearOptions[0].value;
  }, [year, yearOptions]);

  if (loading)
    return (
      <View style={styles.center}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );

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
    data,
  }: {
    item: StandingsTeam;
    index: number;
    data: StandingsTeam[];
  }) => {
    const team =
      league === "NBA"
        ? getTeamByESPNId(Number(item.teamId))
        : league === "WNBA"
          ? getWNBATeamByESPNId(Number(item.teamId))
          : league === "NFL"
            ? getNFLTeamByESPNId(Number(item.teamId))
            : league === "UFL"
              ? getUFLTeam(Number(item.teamId))
              : league === "MLB"
                ? getMLBTeamByEspnId(item.teamId)
                : getNHLTeamByESPNId(Number(item.teamId));

    const route =
      league === "NBA"
        ? "/team/[teamId]"
        : league === "NFL"
          ? "/team/nfl/[teamId]"
          : league === "UFL"
            ? "/team/ufl/[teamId]"
            : league === "WNBA"
              ? "/team/wnba/[teamId]"
              : league === "MLB"
                ? "/team/mlb/[teamId]"
                : "/team/nhl/[teamId]";

    const teamLogo = isDark ? team?.logoLight || team?.logo : team?.logo;
    const teamCode = team?.code;
    const favorited = team ? isFavorite(league, team.id) : false;
    const isLastRow = index === data.length - 1;

    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
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
              pathname: route,
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

  const renderRightItem = (activeColumns: string[]) =>
    function StandingsRightItem({
      item,
      index,
      data,
    }: {
      item: StandingsTeam;
      index: number;
      data: StandingsTeam[];
    }) {
      const team =
        league === "NBA"
          ? getTeamByESPNId(Number(item.teamId))
          : league === "WNBA"
            ? getWNBATeamByESPNId(Number(item.teamId))
            : league === "NFL"
              ? getNFLTeamByESPNId(Number(item.teamId))
              : league === "UFL"
                ? getUFLTeam(Number(item.teamId))
                : league === "MLB"
                  ? getMLBTeamByEspnId(item.teamId)
                  : getNHLTeamByESPNId(Number(item.teamId));

      const favorited = team ? isFavorite(league, team.id) : false;
      const isLastRow = index === data.length - 1;

      const winStreak = item.streak?.startsWith("W");
      const streakColor = winStreak
        ? isDark
          ? Colors.dark.limeGreen
          : Colors.light.green
        : isDark
          ? Colors.dark.lightRed
          : Colors.light.red;

      return (
        <View
          style={[
            styles.row,
            !isLastRow && {
              borderBottomWidth: 1,
              borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
            },
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

            if (label === "W-L")
              value = `${item.wins ?? 0}-${item.losses ?? 0}`;
            if (key === "winPercent" && value != null)
              value = `${(Number(value) * 100).toFixed(1)}%`;
            if ((label === "PPG" || label === "OPP PPG") && value != null)
              value = `${Number(value).toFixed(1)}`;

            const numericValue = Number(value);
            if (!isNaN(numericValue) && numericValue >= 1000)
              value = numericValue.toLocaleString("en-US");

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
    <View style={styles.statsHeaderRow}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#</Text>
      </View>
      <View>
        <Text style={styles.teamHeaderText}>Team</Text>
      </View>
    </View>
  );

  const renderStatsHeader = (activeColumns: string[]) => (
    <View style={styles.statsHeaderRow}>
      {activeColumns.map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function Section({
    title,
    data,
    isFirst,
    isLast,
  }: {
    title: string;
    data: StandingsTeam[];
    isFirst?: boolean;
    isLast?: boolean;
  }) {
    const activeColumns = getActiveColumns(data);

    return (
      <View style={[styles.wrapper, { marginBottom: isLast ? 0 : 12 }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>{title}</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.teamId}
            renderItem={(props) => renderLeftItem({ ...props, data })}
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
              renderItem={(props) =>
                renderRightItem(activeColumns)({ ...props, data })
              }
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
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {isGameDetailScreen && <HeadingTwo isDark={isDark}>Standings</HeadingTwo>}

      <View style={styles.dropdownRow}>
        {league !== "WNBA" && (
          <Dropdown
            options={[
              { label: "Conference", value: "conference" },
              { label: "Division", value: "division" },
            ]}
            selectedValue={sortMode}
            onSelect={(value) => setSortMode(value as any)}
            isDark={isDark}
          />
        )}

        {onYearChange && yearOptions.length > 0 && (
          <Dropdown
            options={yearOptions}
            selectedValue={safeYear}
            onSelect={onYearChange}
            isDark={isDark}
            style={{ marginLeft: 10 }}
          />
        )}
      </View>
      {sortMode === "conference"
        ? Object.values(conferenceConfig)
            .map((conf) => {
              const data =
                conferences?.find(
                  (c) =>
                    c.abbreviation === conf.abbreviation ||
                    c.name === conf.name,
                )?.standings || [];

              return data.length ? { title: conf.name, data } : null;
            })
            .filter(Boolean)
            .map((section, index, arr) => (
              <Section
                key={section!.title}
                title={section!.title}
                data={section!.data}
                isFirst={index === 0} // ✅ only first section gets the dropdown
                isLast={index === arr.length - 1}
              />
            ))
        : // Division mode
          divisionStandings.map((section, index) => (
            <Section
              key={section.title}
              title={section.title}
              data={section.data}
              isFirst={index === 0} // ✅ only first division shows dropdown
              isLast={index === divisionStandings.length - 1}
            />
          ))}
      <StatusLegend league={league} />
    </ScrollView>
  );
};
