import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getCBBTeamLogo, getCBBTeamByESPNId } from "constants/teamsCBB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { useCBBConferenceStandings } from "hooks/BasketballHooks/useCBBConferenceStandings";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { standingsStyles } from "styles/LeagueStyles/StandingsStyles";

type Props = {
  selectedConference?: string;
  onlyTeamConference?: boolean;
  teamName?: string;
};

type ConferenceTeam = {
  teamId?: number | string | null;
  name?: string | null;
  abbreviation?: string | null;
  rank?: number | string | null;
  overall?: string | null;
  confOverall?: string | null;
  divisionOverall?: string | null;
  homeOverall?: string | null;
  awayOverall?: string | null;
  gamesBehind?: string | number | null;
  streak?: string | number | null;
  vsAPTop25?: string | null;
  pointsFor?: string | number | null;
  pointsAgainst?: string | number | null;
};

type ConferenceDivision = {
  name: string;
  teams: ConferenceTeam[];
};

type ConferenceStanding = {
  id: string;
  name: string;
  abbreviation: string;
  shortName: string;
  divisions: ConferenceDivision[];
};

function getStandingRankValue(rank: ConferenceTeam["rank"]) {
  const value = Number(rank);
  return Number.isFinite(value) ? value : 999;
}

function getStreakText(streak: ConferenceTeam["streak"]) {
  if (streak === null || streak === undefined || streak === "-") {
    return "-";
  }

  const streakValue = Number(streak);

  if (!Number.isNaN(streakValue)) {
    if (streakValue > 0) return `W${streakValue}`;
    if (streakValue < 0) return `L${Math.abs(streakValue)}`;
    return "-";
  }

  return String(streak);
}

function normalizeValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function findTeamConferenceId(
  conferences: ConferenceStanding[],
  teamName?: string,
) {
  if (!teamName) return null;

  const target = normalizeValue(teamName);

  for (const conference of conferences) {
    for (const division of conference.divisions ?? []) {
      const foundTeam = division.teams?.find((team) => {
        return (
          normalizeValue(team.name) === target ||
          normalizeValue(team.abbreviation) === target
        );
      });

      if (foundTeam) {
        return conference.id;
      }
    }
  }

  return null;
}

export const CBBConferenceStandingsList = ({
  selectedConference,
  teamName,
  onlyTeamConference = false,
}: Props) => {
  const { conferences, loading, error } = useCBBConferenceStandings();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const { isFavorite } = useFavoriteTeamsContext();

  const safeConferences = Array.isArray(conferences)
    ? (conferences as ConferenceStanding[])
    : [];

  const teamConferenceId = findTeamConferenceId(safeConferences, teamName);

  const selectedConferenceId = onlyTeamConference
    ? teamConferenceId
    : selectedConference;

  const selectedConferenceData =
    selectedConferenceId && selectedConferenceId !== "top25"
      ? safeConferences.find(
          (conference) =>
            String(conference.id) === String(selectedConferenceId),
        )
      : null;

  const conferenceSections =
    selectedConferenceId && selectedConferenceId !== "top25"
      ? selectedConferenceData
        ? [selectedConferenceData]
        : []
      : safeConferences;

  if (loading) {
    return (
      <View style={styles.center}>
        <StandingsSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (conferenceSections.length < 0)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>
          No standings found for{" "}
          {onlyTeamConference
            ? "team conference"
            : selectedConference || "selected conference"}
          .
        </Text>
      </View>
    );

  const renderLeftItem = ({
    item,
    isLastRow,
  }: {
    item: ConferenceTeam;
    index: number;
    isLastRow: boolean;
  }) => {
    const espnId = item.teamId;
    const team = getCBBTeamByESPNId(espnId ?? 0);
    const teamId = team.id;
    const teamLogo = espnId ? getCBBTeamLogo(Number(teamId), isDark) : null;
    const teamCode = item.abbreviation || "-";
    const favorited = teamId ? isFavorite("CBB", String(teamId)) : false;

    const handleTeamPress = () => {
      if (!espnId) return;
      router.push(`/team/cfb/${teamId}`);
    };

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
          <Text style={styles.rankText}>{item.rank ?? "-"}</Text>
        </View>

        <TouchableOpacity onPress={handleTeamPress} style={styles.teamInfo}>
          {teamLogo && <Image source={teamLogo} style={styles.logo} />}

          <Text style={styles.collegeTeamName}>{teamCode}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightItem = ({
    item,
    isLastRow,
    showDivision,
  }: {
    item: ConferenceTeam;
    isLastRow: boolean;
    showDivision: boolean;
  }) => {
    const espnId = item.teamId;
    const team = getCBBTeamByESPNId(espnId ?? 0);
    const teamId = team.id;
    const favorited = teamId ? isFavorite("CBB", String(teamId)) : false;
    const streakText = getStreakText(item.streak);

    const streakColor = streakText.startsWith("W")
      ? isDark
        ? Colors.dark.leafGreen
        : Colors.light.green
      : streakText.startsWith("L")
        ? isDark
          ? Colors.dark.lightRed
          : Colors.light.red
        : isDark
          ? Colors.white
          : Colors.black;

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
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.overall ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.confOverall ?? "-"}</Text>
        </View>

        {showDivision && (
          <View style={styles.statCell}>
            <Text style={styles.statText}>{item.divisionOverall ?? "-"}</Text>
          </View>
        )}

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.homeOverall ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.awayOverall ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.gamesBehind ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: streakColor }]}>
            {streakText}
          </Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsAPTop25 ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsFor ?? "-"}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsAgainst ?? "-"}</Text>
        </View>
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

  const renderStatsHeader = (showDivision: boolean) => (
    <View style={styles.statsHeaderRow}>
      {[
        "Overall",
        "Conference",
        ...(showDivision ? ["Division"] : []),
        "Home",
        "Away",
        "GB",
        "Streak",
        "vs Top 25",
        "Pts For",
        "Pts Against",
      ].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function ConferenceSection({
    conference,
    isLast,
  }: {
    conference: ConferenceStanding;
    isLast: boolean;
  }) {
    const validDivisions = (conference.divisions ?? []).filter(
      (division) => Array.isArray(division.teams) && division.teams.length > 0,
    );

    const hasDivisions =
      validDivisions.length > 1 ||
      validDivisions.some((division) => division.name !== "Overall");

    return (
      <View style={[styles.wrapper, { marginBottom: isLast ? 0 : 12 }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>
            {conference.shortName || conference.name}
          </Text>
        </View>

        {validDivisions.map((division) => {
          const sortedTeams = division.teams
            .slice()
            .sort(
              (a, b) =>
                getStandingRankValue(a.rank) - getStandingRankValue(b.rank),
            );

          return (
            <View key={`${conference.id}-${division.name}`}>
              {hasDivisions && (
                <Text style={styles.collegeDivisionHeader}>
                  {division.name}
                </Text>
              )}

              <View style={{ flexDirection: "row" }}>
                <FlatList
                  data={sortedTeams}
                  keyExtractor={(item) => String(item.teamId)}
                  renderItem={({ item, index }) =>
                    renderLeftItem({
                      item,
                      index,
                      isLastRow: index === sortedTeams.length - 1,
                    })
                  }
                  scrollEnabled={false}
                  ListHeaderComponent={renderHeader}
                  stickyHeaderIndices={[0]}
                />

                <ScrollView
                  horizontal
                  style={{ width: 280 }}
                  showsHorizontalScrollIndicator={false}
                >
                  <FlatList
                    data={sortedTeams}
                    keyExtractor={(item) => String(item.teamId)}
                    renderItem={({ item, index }) =>
                      renderRightItem({
                        item,
                        showDivision: hasDivisions,
                        isLastRow: index === sortedTeams.length - 1,
                      })
                    }
                    scrollEnabled={false}
                    ListHeaderComponent={renderStatsHeader(hasDivisions)}
                    stickyHeaderIndices={[0]}
                  />
                </ScrollView>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
    >
      {conferenceSections.length > 0 ? (
        conferenceSections.map((conference, index) => (
          <ConferenceSection
            key={conference.id}
            conference={conference}
            isLast={index === conferenceSections.length - 1}
          />
        ))
      ) : (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={styles.emptyText}>
            No standings found for{" "}
            {onlyTeamConference
              ? "team conference"
              : selectedConference || "selected conference"}
            .
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
