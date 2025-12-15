import { Dropdown } from "components/Dropdown";
import { StatusLegend } from "components/NFL/Standings/StatusLegend";
import { StandingsSkeleton } from "components/Standings/StandingsSkeleton";
import { Fonts } from "constants/fonts";
import { getTeamByESPNId, nflDivisionsById, teams } from "constants/teamsNFL";
import { useRouter } from "expo-router";
import {
  NFLDivisionTeam,
  useNFLStandings,
} from "hooks/NFLHooks/useNFLStandings";
import { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { getStyles } from "styles/Standings.styles";
import { StatusBadge } from "./StatusBadge";
type DivisionMap = Record<string, NFLDivisionTeam[]>;

export const NFLStandingsList = () => {
  const { standings: conferences, loading, error } = useNFLStandings();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const [sortMode, setSortMode] = useState<"conference" | "division">(
    "conference"
  );

  // ========= 1. Loading / Error =========
  if (loading)
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );

  if (error || !conferences)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>
          {error || "Failed to load standings"}
        </Text>
      </View>
    );

  // ========= 2. Extract AFC / NFC =========
  const afc = conferences.find(
    (c) => c.name === "AFC" || c.name.includes("American")
  );
  const nfc = conferences.find(
    (c) => c.name === "NFC" || c.name.includes("National")
  );

  const afcData: NFLDivisionTeam[] = afc?.standings ?? [];
  const nfcData: NFLDivisionTeam[] = nfc?.standings ?? [];

  // ========= 3. Apply local division map =========
  const divisions: DivisionMap = {};

  Object.entries(nflDivisionsById).forEach(([divisionName, idList]) => {
    divisions[divisionName] = conferences
      .flatMap((conf) => conf.standings)
      .filter((team) => idList.includes(team.teamId));
  });

  const getClinchStatus = (team: NFLDivisionTeam) => {
    const text = team.clincher?.toLowerCase() ?? "";

    if (text.includes("eliminated")) {
      return { type: "eliminated", label: "E" };
    }

    if (text.includes("clinched division")) {
      return { type: "division", label: "X" }; // standard division clinch label
    }

    if (text.includes("clinched playoff")) {
      return { type: "playoffs", label: "P" };
    }

    return null;
  };

  // ========= 4. Clinched Logic =========
  const hasClinchedConference = (
    team: NFLDivisionTeam,
    confTeams: NFLDivisionTeam[]
  ) => {
    const totalGames = 18;

    const w = team.wins ?? 0;
    const l = team.losses ?? 0;
    const t = team.ties ?? 0;

    for (const other of confTeams) {
      if (other.teamId === team.teamId) continue;

      const ow = other.wins ?? 0;
      const ol = other.losses ?? 0;
      const ot = other.ties ?? 0;

      const teamRemaining = totalGames - (w + l + t);
      const otherRemaining = totalGames - (ow + ol + ot);

      if (ow + otherRemaining > w) return false;
    }

    return true;
  };

  // ========= 5. Render Functions =========

  const renderLeftItem = ({
    item,
    index,
  }: {
    item: NFLDivisionTeam;
    index: number;
  }) => {
    const teamMeta = teams.find((t) => t.espnID === item.teamId);

    const logo: ImageSourcePropType = isDark
      ? teamMeta?.logoLight ||
        teamMeta?.logo ||
        require("assets/Football/NFL_Logos/NFL.png")
      : teamMeta?.logo || require("assets/Football/NFL_Logos/NFL.png");

    const confList = item.conference.includes("American") ? afcData : nfcData;

    const clinch = getClinchStatus(item);

    const showConfBadge =
      sortMode === "conference" &&
      !clinch && // don't show conference badge if ESPN already has clincher
      hasClinchedConference(item, confList);

    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <View style={styles.teamInfo}>
          <TouchableOpacity
            style={styles.teamInfoWrapper}
            onPress={() => {
              const team = getTeamByESPNId(item.teamId);
              if (!team) return;
              router.push({
                pathname: "/team/nfl/[teamId]",
                params: { teamId: String(team.id) },
              });
            }}
          >
            <Image source={logo} style={styles.logo} />
            <Text style={styles.teamName}>{item.abbreviation}</Text>
            {clinch ? (
              <StatusBadge
                clincher={item.clincher} // let badge parse it
              />
            ) : showConfBadge ? (
              <StatusBadge
                code={String(item.playoffSeed ?? "")}
                clinchedConference
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRightItem = ({ item }: { item: NFLDivisionTeam }) => {
    const w = item.wins ?? 0;
    const l = item.losses ?? 0;
    const t = item.ties ?? 0;

    const total = w + l + t;
    const pct = total > 0 ? ((w / total) * 100).toFixed(1) + "%" : "0%";

    const streakColor = item.streak?.startsWith("W") ? "limegreen" : "tomato";

    return (
      <View style={styles.row}>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{`${w}${
            t > 0 ? `-${t}` : ""
          }-${l}`}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{pct}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.homeRecord}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.roadRecord}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.vsdiv}</Text>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.conferenceRecord}</Text>
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
      <Text style={styles.teamHeaderText}>Team</Text>
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

  const Section = ({
    title,
    data,
  }: {
    title: string;
    data: NFLDivisionTeam[];
  }) => (
    <View style={{ marginTop: 12 }}>
      <View style={styles.header}>
        <Text style={styles.heading}>{title}</Text>
      </View>

      <View style={{ flexDirection: "row" }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.teamId.toString()}
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
            keyExtractor={(item) => item.teamId.toString()}
            renderItem={renderRightItem}
            scrollEnabled={false}
            ListHeaderComponent={renderStatsHeader}
            stickyHeaderIndices={[0]}
          />
        </ScrollView>
      </View>
    </View>
  );

  // ========= FINAL RENDER =============
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
        onSelect={(value) => setSortMode(value as any)}
        isDark={isDark}
        absolute
      />

      {sortMode === "conference" ? (
        <>
          <Section title="AFC" data={afcData} />
          <Section title="NFC" data={nfcData} />
        </>
      ) : (
        Object.entries(divisions).map(([name, list]) => (
          <Section key={name} title={`${name} Division`} data={list} />
        ))
      )}

      <StatusLegend />
    </ScrollView>
  );
};
