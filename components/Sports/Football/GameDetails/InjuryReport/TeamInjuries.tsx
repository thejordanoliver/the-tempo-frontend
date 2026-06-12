import playerPlaceholder from "assets/Placeholders/playerPlaceholder.png";
import TeamInjuriesSkeleton from "components/Skeletons/GameDetails/TeamInjuriesSkeleton";
import { globalStyles } from "constants/styles";
import { getNFLTeamLogo, getTeamByESPNId } from "constants/teamsNFL";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { teamInjuryStyles } from "styles/GameDetailStyles/TeamInjuriesList.styles";
import HeadingTwo from "../../../../Headings/HeadingTwo";
import FixedWidthTabBar from "../../../../TabBars/FixedWidthTabBar";

export type Injury = {
  espnId: number | null;
  name: string;
  position?: string | null;
  jerseyNumber?: number | null;
  image?: string | null;
  status?: string | null;
  detail?: string | null;
  returnDate?: string | null;
  teamId?: number | null;
  location: string;
};

type Props = {
  injuries?: Injury[]; // ✅ optional now
  loading: boolean;
  error: any;
  awayTeamId?: string | number;
  homeTeamId?: string | number;
  awayTeamAbbr?: string;
  homeTeamAbbr?: string;
  isDark: boolean;
};

const DEFAULT_HEADSHOT = playerPlaceholder;

export default function TeamInjuries({
  injuries = [], // ✅ DEFAULT FIX
  loading,
  error,
  awayTeamId,
  homeTeamId,
  awayTeamAbbr,
  homeTeamAbbr,
  isDark,
}: Props) {
  const styles = teamInjuryStyles(isDark);
  const global = globalStyles(isDark);

  /* -------------------------------------------------- */
  /* Group injuries by teamId                           */
  /* -------------------------------------------------- */

  const grouped = useMemo(() => {
    const list = Array.isArray(injuries) ? injuries : [];

    const away = list.filter((i) => String(i.teamId) === String(awayTeamId));

    const home = list.filter((i) => String(i.teamId) === String(homeTeamId));

    // 🔥 fallback: if teamIds are missing, split evenly
    if (!away.length && !home.length && list.length) {
      return {
        away: list.slice(0, Math.ceil(list.length / 2)),
        home: list.slice(Math.ceil(list.length / 2)),
      };
    }

    return { away, home };
  }, [injuries, awayTeamId, homeTeamId]);

  const tabs = useMemo(() => {
    return [
      awayTeamAbbr?.toUpperCase() ?? "AWAY",
      homeTeamAbbr?.toUpperCase() ?? "HOME",
    ];
  }, [awayTeamAbbr, homeTeamAbbr]);

  const [selected, setSelected] = useState(tabs[0]);

  useEffect(() => {
    if (tabs[0] !== selected) {
      setSelected(tabs[0]);
    }
  }, [tabs.join("|")]);

  const selectedInjuries = useMemo(() => {
    return selected === tabs[0] ? grouped.away : grouped.home;
  }, [grouped, selected, tabs]);

  /* -------------------------------------------------- */
  /* States                                             */
  /* -------------------------------------------------- */

  if (loading) {
    return <TeamInjuriesSkeleton />;
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load injuries</Text>
      </View>
    );
  }

  if (!injuries.length) return null;

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */

  const renderInjury = ({ item, index }: { item: Injury; index: number }) => {
    const avatar = item.image || DEFAULT_HEADSHOT;

    return (
      <View
        style={[
          styles.injuryItem,
          {
            borderBottomWidth:
              index === selectedInjuries.length - 1
                ? 0
                : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.infoSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.name}>{item.name ?? "Unknown Player"}</Text>
              <Text style={styles.jersey}>
                {item.position ?? "—"}{" "}
                {item.jerseyNumber ? `#${item.jerseyNumber}` : ""}
              </Text>
            </View>

            {item.detail && (
              <>
                <Text style={styles.status}>{item.status}</Text>
                <Text style={styles.details}>
                  {item.detail} — {item.location ?? "N/A"}
                </Text>
              </>
            )}
          </View>
        </View>

        {item.returnDate && (
          <View style={styles.bottom}>
            <Text style={styles.status}>
              Return: {new Date(item.returnDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View>
      <HeadingTwo isDark={isDark}>Injury Report</HeadingTwo>
      <View style={styles.wrapper}>
        <FixedWidthTabBar
          tabs={tabs}
          selected={selected}
          isDark={isDark}
          onTabPress={setSelected}
          renderLabel={(tabId, isSelected, tabStyles) => {
            const team = getTeamByESPNId(tabId);
            const teamCode = team?.code;
            const logo = getNFLTeamLogo(Number(team?.id), isDark);

            return (
              <View style={styles.tabLabel}>
                {logo && (
                  <Image
                    source={logo}
                    style={[styles.tabLogo, { opacity: isSelected ? 1 : 0.5 }]}
                  />
                )}

                <Text
                  style={[tabStyles.tab, isSelected && tabStyles.tabSelected]}
                >
                  {teamCode}
                </Text>
              </View>
            );
          }}
        />

        <FlatList
          data={selectedInjuries}
          renderItem={renderInjury}
          keyExtractor={(i, idx) => `${i.espnId ?? idx}`}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
