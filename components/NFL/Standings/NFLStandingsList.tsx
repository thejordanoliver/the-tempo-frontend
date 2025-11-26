// components/NFLStandingsList.tsx
import { Dropdown } from "components/Dropdown";
import { StatusLegend } from "components/NFL/Standings/StatusLegend";
import { StandingsSkeleton } from "components/Standings/StandingsSkeleton";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsNFL";
import {
  NFLTeamRankings,
  useNFLStandings,
} from "hooks/NFLHooks/useNFLStandings";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { getStyles } from "styles/Standings.styles";
import { StatusBadge } from "./StatusBadge";
type SectionType = {
  title: string;
  data: NFLTeamRankings[];
};

export const NFLStandingsList = () => {
  const { standings = [], loading, error } = useNFLStandings(); // default empty array
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference"
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  // --- Grouping logic safely ---
  const east: NFLTeamRankings[] = standings
    .filter((t) => t.conference === "American Football Conference")
    .sort((a, b) => parseInt(b.wins) - parseInt(a.wins));

  const west: NFLTeamRankings[] = standings
    .filter((t) => t.conference === "National Football Conference")
    .sort((a, b) => parseInt(b.wins) - parseInt(a.wins));

  const divisions: Record<string, NFLTeamRankings[]> = {};
  standings.forEach((team) => {
    if (!divisions[team.division]) divisions[team.division] = [];
    divisions[team.division].push(team);
  });

  const hasClinchedConference = (
    team: NFLTeamRankings,
    confTeams: NFLTeamRankings[]
  ) => {
    const totalGames = 18; // NFL regular season

    const teamWins = parseInt(team.wins);
    const teamLosses = parseInt(team.losses);
    const teamTies = parseInt(team.ties || "0");
    const teamRemaining = totalGames - (teamWins + teamLosses + teamTies);

    // Maximum wins other teams could achieve
    for (const other of confTeams) {
      if (other.id === team.id) continue;

      const otherWins = parseInt(other.wins);
      const otherLosses = parseInt(other.losses);
      const otherTies = parseInt(other.ties || "0");
      const otherRemaining = totalGames - (otherWins + otherLosses + otherTies);

      const otherMaxWins = otherWins + otherRemaining;

      // If any other team could surpass current team, it hasn't clinched yet
      if (otherMaxWins > teamWins) return false;
    }

    return true; // No other team can surpass this team
  };

  // --- Render functions ---
  const renderLeftItem = ({
    item,
    index,
  }: {
    item: NFLTeamRankings;
    index: number;
  }) => {
    const team = teams.find((t) => t.espnID === item.id);
    const teamLogo: ImageSourcePropType = isDark
      ? team?.logoLight ||
        team?.logo ||
        require("assets/Football/NFL_Logos/NFL.png")
      : team?.logo || require("assets/Football/NFL_Logos/NFL.png");

    let showBadge = false;
    if (sortMode === "conference") {
      const confTeams =
        item.conference === "American Football Conference" ? east : west;
      showBadge = hasClinchedConference(item, confTeams);
    }

    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.teamInfo}>
          <Image source={teamLogo} style={styles.logo} />
          <Text style={styles.teamName}>{item.abbreviation}</Text>
          {showBadge && (
            <StatusBadge code={item.seed} clinchedConference={true} />
          )}
        </View>
      </View>
    );
  };

  const renderRightItem = ({ item }: { item: NFLTeamRankings }) => {
    const totalGames = parseInt(item.wins) + parseInt(item.losses);
    const winPct =
      totalGames > 0
        ? ((parseInt(item.wins) / totalGames) * 100).toFixed(1) + "%"
        : "0%";
    const ties = parseInt(item.ties || "0");

    // Determine streak color
    const winStreak = item.streak?.startsWith("W");
    const streakColor = winStreak ? "limegreen" : "tomato";

    return (
      <View style={styles.row}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>
            {item.wins}
            {ties > 0 ? `-${ties}` : ""}-{item.losses}
          </Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{winPct}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.home}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.road}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsDiv}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsConf}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsFor}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.pointsAgainst}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statText, { color: streakColor }]}>
            {item.streak}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { fontFamily: Fonts.OSSEMIBOLD }]}>
          #
        </Text>
      </View>
      <View>
        <Text style={styles.teamHeaderText}>Team</Text>
      </View>
    </View>
  );

  const renderStatsHeader = () => (
    <View style={styles.row}>
      {[
        "W-L",
        "Win %",
        "Home",
        "Away",
        "vs Div",
        "vs Conf",
        "Pts For",
        "Pts Against",
        "Streak",
      ].map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  function Section({ title, data }: SectionType) {
    return (
      <View style={{ marginTop: 12 }}>
        <View style={[styles.header]}>
          <Text style={styles.heading}>{title}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderLeftItem}
            scrollEnabled={false}
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ width: 220 }} // increased
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderRightItem}
              scrollEnabled={false}
              ListHeaderComponent={renderStatsHeader}
              stickyHeaderIndices={[0]}
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
      }}
    >
      <Dropdown
        options={[
          { label: "Conference", value: "conference" },
          { label: "Division", value: "division" },
        ]}
        selectedValue={sortMode}
        onSelect={(value) => setSortMode(value as "conference" | "division")}
        isDark={isDark}
      />

      {sortMode === "conference" ? (
        <>
          <Section title="AFC" data={east} />
          <Section title="NFC" data={west} />
        </>
      ) : (
        Object.entries(divisions).map(([divisionName, teams]) => (
          <Section
            key={divisionName}
            title={`${divisionName} Division`}
            data={teams}
          />
        ))
      )}
      <StatusLegend />
    </ScrollView>
  );
};
