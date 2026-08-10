// components/TeamPlayerList.tsx
import { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PlayerCard } from "@/components/Sports/Basketball/Player/PlayerCard";
import { Player } from "@/hooks/LeagueHooks/useRoster";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { rosterStyles } from "styles/TeamStyles/RosterStyles";

type SupportedRosterLeague =
  | "MLB"
  | "NHL"
  | "NFL"
  | "CFB"
  | "SOCCER";

interface RosterProps {
  players: Player[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  league?: SupportedRosterLeague;
}

const MLB_GROUP_ORDER = [
  "Pitchers",
  "Catchers",
  "Infielders",
  "Outfielders",
  "Designated Hitters",
  "Two-Way Players",
  "Other",
];

const FOOTBALL_POSITION_ORDER = [
  "QB",
  "RB",
  "FB",
  "WR",
  "TE",
  "G",
  "C",
  "OT",
  "OL",
  "DT",
  "DE",
  "EDGE",
  "LB",
  "CB",
  "DB",
  "S",
  "K",
  "P",
  "LS",
  "Other",
];

const NHL_GROUP_ORDER = [
  "Forwards",
  "Defensemen",
  "Goalies",
  "Other",
];

const SOCCER_GROUP_ORDER = [
  "Forwards",
  "Midfielders",
  "Defenders",
  "Goalkeepers",
  "Other",
];

const DEFAULT_GROUP_ORDER = [
  "Guards",
  "Forwards",
  "Centers",
  "Other",
];

function getPositionGroup(
  position?: string | null,
  league?: SupportedRosterLeague,
) {
  const pos = (position ?? "").trim().toUpperCase();

  if (league === "MLB") {
    if (
      [
        "P",
        "RP",
        "SP",
        "CP",
        "CL",
        "RHP",
        "LHP",
        "PITCHER",
        "RELIEF PITCHER",
        "STARTING PITCHER",
      ].includes(pos)
    ) {
      return "Pitchers";
    }

    if (["C", "CATCHER"].includes(pos)) {
      return "Catchers";
    }

    if (
      [
        "1B",
        "2B",
        "3B",
        "SS",
        "IF",
        "INF",
        "INFIELDER",
      ].includes(pos)
    ) {
      return "Infielders";
    }

    if (
      ["LF", "CF", "RF", "OF", "OUTFIELDER"].includes(pos)
    ) {
      return "Outfielders";
    }

    if (["DH", "DESIGNATED HITTER"].includes(pos)) {
      return "Designated Hitters";
    }

    if (
      ["TWP", "TWO-WAY PLAYER", "TWO WAY PLAYER"].includes(pos)
    ) {
      return "Two-Way Players";
    }

    return "Other";
  }

  if (league === "NHL") {
    if (
      [
        "C",
        "LW",
        "RW",
        "F",
        "FORWARD",
        "CENTER",
        "LEFT WING",
        "RIGHT WING",
      ].includes(pos)
    ) {
      return "Forwards";
    }

    if (
      [
        "D",
        "LD",
        "RD",
        "DEFENSE",
        "DEFENSEMAN",
        "DEFENCEMAN",
        "LEFT DEFENSE",
        "RIGHT DEFENSE",
      ].includes(pos)
    ) {
      return "Defensemen";
    }

    if (["G", "GK", "GOALIE", "GOALTENDER"].includes(pos)) {
      return "Goalies";
    }

    return "Other";
  }

  if (league === "NFL" || league === "CFB") {
    if (pos === "QB") return "QB";
    if (pos === "RB") return "RB";
    if (pos === "FB") return "FB";
    if (pos === "WR") return "WR";
    if (pos === "TE") return "TE";

    if (["G", "OG"].includes(pos)) return "G";
    if (pos === "C") return "C";
    if (pos === "OT") return "OT";
    if (pos === "OL") return "OL";

    if (["DT", "DL", "NT"].includes(pos)) return "DT";
    if (pos === "DE") return "DE";
    if (pos === "EDGE") return "EDGE";

    if (["LB", "ILB", "OLB", "MLB"].includes(pos)) {
      return "LB";
    }

    if (pos === "CB") return "CB";
    if (pos === "DB") return "DB";

    if (["S", "FS", "SS"].includes(pos)) return "S";

    if (["K", "PK"].includes(pos)) return "K";
    if (pos === "P") return "P";
    if (pos === "LS") return "LS";

    return "Other";
  }

  // This must come before basketball grouping because soccer uses
  // overlapping abbreviations such as G and F.
  if (league === "SOCCER") {
    if (
      ["F", "FW", "FORWARD", "ST", "STRIKER"].includes(pos)
    ) {
      return "Forwards";
    }

    if (
      [
        "M",
        "MF",
        "MIDFIELDER",
        "AM",
        "AMF",
        "CAM",
        "CM",
        "CMF",
        "DM",
        "DMF",
        "CDM",
        "LM",
        "RM",
      ].includes(pos)
    ) {
      return "Midfielders";
    }

    if (
      [
        "D",
        "DF",
        "DEFENDER",
        "CB",
        "LB",
        "RB",
        "LWB",
        "RWB",
      ].includes(pos)
    ) {
      return "Defenders";
    }

    if (
      ["G", "GK", "GOALKEEPER", "GOALIE"].includes(pos)
    ) {
      return "Goalkeepers";
    }

    return "Other";
  }

  if (["PG", "SG", "G", "GUARD"].includes(pos)) {
    return "Guards";
  }

  if (["SF", "PF", "F", "FORWARD"].includes(pos)) {
    return "Forwards";
  }

  if (["C", "CENTER"].includes(pos)) {
    return "Centers";
  }

  return "Other";
}

function getJerseySortValue(player: Player) {
  const jersey = Number.parseInt(
    String(player.jersey_number ?? ""),
    10,
  );

  return Number.isFinite(jersey)
    ? jersey
    : Number.MAX_SAFE_INTEGER;
}

function sortPlayers(players: Player[]) {
  return [...players].sort((a, b) => {
    const jerseyA = getJerseySortValue(a);
    const jerseyB = getJerseySortValue(b);

    if (jerseyA !== jerseyB) {
      return jerseyA - jerseyB;
    }

    return (a.full_name ?? "").localeCompare(
      b.full_name ?? "",
    );
  });
}

function getGroupOrder(league?: SupportedRosterLeague) {
  if (league === "MLB") return MLB_GROUP_ORDER;
  if (league === "NHL") return NHL_GROUP_ORDER;

  if (league === "NFL" || league === "CFB") {
    return FOOTBALL_POSITION_ORDER;
  }

  if (league === "SOCCER") {
    return SOCCER_GROUP_ORDER;
  }

  return DEFAULT_GROUP_ORDER;
}

export default function Roster({
  players,
  loading,
  error,
  refreshing,
  onRefresh,
  league,
}: RosterProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const styles = rosterStyles;
  const tintColor = isDark ? Colors.white : Colors.black;

  const groupedPlayers = useMemo(() => {
    const groupOrder = getGroupOrder(league);

    const groups = groupOrder.reduce<Record<string, Player[]>>(
      (accumulator, group) => {
        accumulator[group] = [];
        return accumulator;
      },
      {},
    );

    players.forEach((player) => {
      const group = getPositionGroup(player.position, league);

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(player);
    });

    return groupOrder
      .map((title) => ({
        title,
        data: sortPlayers(groups[title] ?? []),
      }))
      .filter((group) => group.data.length > 0);
  }, [players, league]);

  if (loading) {
    return <PlayerCardSkeletonList />;
  }

  if (error) {
    return (
      <View style={styles.contentContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (players.length === 0) {
    return (
      <View style={styles.contentContainer}>
        <Text style={global.emptyText}>
          No players found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
        />
      }
    >
      {groupedPlayers.map((group) => (
        <View key={group.title}>
          <HeadingTwo isDark={isDark}>
            {group.title}
          </HeadingTwo>

          <View style={styles.playerList}>
            {group.data.map((player) => (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.full_name}
                position={player.position}
                headshot={player.headshot_url}
                number={player.jersey_number}
                teamId={player.team_id}
                league={league}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}