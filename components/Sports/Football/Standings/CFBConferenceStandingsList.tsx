import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeamByESPNId, getCFBTeamLogo } from "constants/teamsCFB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import {
  type CFBStandingConference,
  type CFBStandingTeam,
} from "hooks/FootballHooks/useCFBConferenceStandings";
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
  selectedConference?: string | number;
  conferences: CFBStandingConference[];
  loading: boolean;
  error: string | null;
  onlyTeamConference?: boolean;
 
};

type ConferenceTeam = CFBStandingTeam;
type ConferenceStanding = CFBStandingConference;

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

export const CFBConferenceStandingsList = ({
  conferences,
  loading,
  error,
}: Props) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);
  const router = useRouter();
  const { isFavorite } = useFavoriteTeamsContext();

  const renderLeftItem = ({
    item,
    isLastRow,
  }: {
    item: ConferenceTeam;
    index: number;
    isLastRow: boolean;
  }) => {
    const espnId = item.id;
    const team = getCFBTeamByESPNId(espnId ?? 0);
    const teamId = team?.id;
    const teamLogo = teamId ? getCFBTeamLogo(Number(teamId), isDark) : null;
    const teamCode = item.code || "-";
    const favorited = teamId ? isFavorite("CFB", String(teamId)) : false;

    const handleTeamPress = () => {
      if (!teamId) return;
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
    const espnId = item.id;
    const team = getCFBTeamByESPNId(espnId ?? 0);
    const teamId = team?.id;
    const favorited = teamId ? isFavorite("CFB", String(teamId)) : false;
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
                  keyExtractor={(item) => String(item.id)}
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
                    keyExtractor={(item) => String(item.id)}
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

  if (conferences.length < 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No standings found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {conferences.map((conference, index) => (
        <ConferenceSection
          key={conference.id}
          conference={conference}
          isLast={index === conferences.length - 1}
        />
      ))}
    </ScrollView>
  );
};
