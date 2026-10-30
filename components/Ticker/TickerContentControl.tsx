import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TICKER_TEAMS } from "constants/tickerTeams";
import { LEAGUE_CONFIG } from "constants/leagues";
import PillTabs from "components/TabBars/PillTabs";
import { ticker, useTickerStore } from "store/tickerStore";
import {
  LEAGUES,
  tickerSupportsExpandedLeagues,
} from "services/ticker/protocol";
import {
  TickerSettingsSection,
  TickerSettingOption,
  TickerSettingToggle,
} from "./TickerSettingsSection";
import TickerSelectionSheet from "./TickerSelectionSheet";
import { useTickerTheme } from "./TickerUI";
import type { SupportedTickerLeague, TickerCommandType } from "types/ticker";

const POLL_OPTIONS = [
  { value: "ap", label: "AP Top 25", icon: "ribbon-outline" },
  { value: "coaches", label: "Coaches Top 25", icon: "people-outline" },
  { value: "cfp", label: "College Football Playoff", icon: "trophy-outline" },
] as const;

function getScheduleTeams(league: SupportedTickerLeague | null | undefined) {
  if (!league) return [];
  return TICKER_TEAMS[league]
    .filter(
      (team) =>
        team.id > 0 &&
        team.id <= 0xffffff &&
        team.isActive &&
        !team.isAllStar &&
        !team.isNational,
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function getScoreDescription(
  league: SupportedTickerLeague | null | undefined,
  top25Only: boolean,
) {
  if (top25Only) return "Games featuring a Top 25 team, updated automatically.";
  return league === "cfb" || league === "nfl"
    ? "This week’s games, updated automatically."
    : "Today’s games, updated automatically.";
}

export default function TickerContentControl() {
  const state = useTickerStore();
  const { isDark, text } = useTickerTheme();
  const [picker, setPicker] = useState<"league" | "team" | null>(null);
  const league = state.settings?.selectedLeague;
  const mode = state.settings?.viewMode ?? "scores";
  const contentType =
    mode === "scores" || mode === "schedule" ? mode : "rankings";
  const college = league === "cfb" || league === "mcbb" || league === "wcbb";
  const unlocked =
    state.connection === "connected" &&
    state.authorized &&
    !state.authorizing &&
    !state.renaming &&
    Object.keys(state.pendingCommands).length === 0;
  const supported = (command: TickerCommandType) =>
    state.status?.capabilities.includes(command) ?? false;
  const enabled = (command: TickerCommandType) =>
    unlocked && supported(command);
  const available = useMemo(() => getScheduleTeams(league), [league]);
  const selectedTeam = available.find(
    (team) => team.id === state.settings?.teamId,
  );
  const leagueOptions = LEAGUES.filter(
    (value, index) =>
      index < 3 || tickerSupportsExpandedLeagues(state.status?.firmwareVersion),
  ).map((value) => ({
    id: value,
    name: LEAGUE_CONFIG[value].label,
    logo: isDark ? LEAGUE_CONFIG[value].logoLight : LEAGUE_CONFIG[value].logo,
    primaryColor: LEAGUE_CONFIG[value].color,
  }));
  const teamOptions = available.map((team) => ({
    id: String(team.id),
    name: team.fullName,
    searchTerms: `${team.shortName ?? ""} ${team.code}`,
    logo:
      isDark || state.settings?.teamId === team.id
        ? (team.logoLight ?? team.logo)
        : team.logo,
    primaryColor: team.primaryColor ?? undefined,
  }));
  const pollOptions = POLL_OPTIONS.filter(
    (poll) => poll.value !== "cfp" || league === "cfb",
  );
  const closePicker = () => setPicker(null);
  const changeContentType = (value: string) => {
    if (!enabled("set_view")) return;
    if (value === "schedule") setPicker("team");
    else
      void ticker.command({
        type: "set_view",
        value: value === "rankings" ? "ap" : "scores",
      });
  };
  const selectLeague = (id: string) => {
    const value = LEAGUES.find((item) => item === id);
    return value
      ? ticker.updateSetting({ type: "set_league", value })
      : Promise.resolve(false);
  };

  return (
    <TickerSettingsSection title="Content" icon="albums-outline">
      <TickerSettingOption
        label="League"
        icon={league ? undefined : "trophy-outline"}
        value={league ? LEAGUE_CONFIG[league].label : "Choose a league"}
        logo={
          league
            ? isDark
              ? LEAGUE_CONFIG[league].logoLight
              : LEAGUE_CONFIG[league].logo
            : undefined
        }
        disabled={!enabled("set_league")}
        onPress={() => setPicker("league")}
      />
      <View style={styles.contentType}>
        <Text style={text.label}>Show on your ticker</Text>
        <PillTabs
          tabs={[
            { label: "Scores", value: "scores" },
            { label: "Schedule", value: "schedule" },
            ...(college ? [{ label: "Rankings", value: "rankings" }] : []),
          ]}
          selectedValue={contentType}
          containerStyle={styles.contentTabs}
          tabStyle={styles.contentTab}
          disabled={!enabled("set_view")}
          onChange={changeContentType}
        />
      </View>
      {contentType === "scores" && (
        <Text style={text.caption}>
          {getScoreDescription(league, college && !!state.settings?.top25Only)}
        </Text>
      )}
      {contentType === "schedule" && (
        <>
          <TickerSettingOption
            label="Team"
            icon={selectedTeam ? undefined : "people-outline"}
            value={selectedTeam?.fullName ?? "Choose a team"}
            logo={
              selectedTeam
                ? isDark
                  ? (selectedTeam.logoLight ?? selectedTeam.logo)
                  : selectedTeam.logo
                : undefined
            }
            disabled={!enabled("set_team_schedule")}
            onPress={() => setPicker("team")}
          />
          <Text style={text.caption}>
            Completed and upcoming games from this team’s current season.
          </Text>
        </>
      )}
      {contentType === "rankings" && (
        <View style={styles.pollOptions}>
          {pollOptions.map((poll) => (
            <TickerSettingOption
              key={poll.value}
              label={poll.label}
              icon={poll.icon}
              selected={mode === poll.value}
              disabled={!enabled("set_view")}
              onPress={() =>
                void ticker.command({ type: "set_view", value: poll.value })
              }
            />
          ))}
          <Text style={[text.caption, styles.pollDescription]}>
            Rankings appear when the selected poll is published.
          </Text>
        </View>
      )}
      {college && contentType !== "rankings" && (
        <TickerSettingToggle
          label="Show team rankings"
          icon="ribbon-outline"
          description="Add Top 25 ranks beside team names."
          value={state.settings?.showRankings ?? false}
          disabled={
            !enabled("set_show_rankings") ||
            state.settings?.showRankings == null
          }
          onValueChange={(value) =>
            void ticker.command({ type: "set_show_rankings", value })
          }
        />
      )}
      {college && contentType === "scores" && (
        <TickerSettingToggle
          label="Top 25 games only"
          icon="funnel-outline"
          description="Only games featuring a ranked team."
          value={state.settings?.top25Only ?? false}
          disabled={
            !enabled("set_top25_only") || state.settings?.top25Only == null
          }
          onValueChange={(value) =>
            void ticker.command({ type: "set_top25_only", value })
          }
        />
      )}
      {state.status && !supported("set_view") && (
        <Text style={text.caption}>
          Team schedules and poll views need ticker firmware 0.5.0 or newer.
        </Text>
      )}
      <TickerSelectionSheet
        visible={picker === "league"}
        title="Choose a league"
        items={leagueOptions}
        selectedId={league}
        disabled={!enabled("set_league")}
        error={state.error}
        onClose={closePicker}
        onSelect={selectLeague}
      />
      <TickerSelectionSheet
        key={league ?? "unknown"}
        visible={picker === "team"}
        title="Choose a team"
        subtitle={
          league
            ? `${LEAGUE_CONFIG[league].label} · Current-season schedule`
            : undefined
        }
        items={teamOptions}
        selectedId={
          state.settings?.teamId ? String(state.settings.teamId) : null
        }
        searchable
        disabled={!enabled("set_team_schedule")}
        error={state.error}
        onClose={closePicker}
        onSelect={(id) =>
          ticker.command({ type: "set_team_schedule", value: Number(id) })
        }
      />
    </TickerSettingsSection>
  );
}

const styles = StyleSheet.create({
  contentType: { gap: 8 },
  contentTabs: { marginTop: 0, marginBottom: 0 },
  contentTab: { paddingHorizontal: 8, minHeight: 44 },
  pollOptions: { gap: 2 },
  pollDescription: { marginTop: 8 },
});
