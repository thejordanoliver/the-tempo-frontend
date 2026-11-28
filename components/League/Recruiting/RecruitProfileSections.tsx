import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import CenteredHeader from "components/Headings/CenteredHeader";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlayerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import { RecruitProfileStyles } from "styles/PlayerStyles/RecruitProfileStyles";
import { StatCardStyles } from "styles/PlayerStyles/StatCardStyles";
import type {
  RecruitSchoolSectionProps,
  RecruitSectionProps,
} from "types/recruiting/recruits";
import { formatDate } from "utils/common/dateUtils";
import {
  formatRecruitRating,
  getRecruitRanking,
  getRecruitStatus,
} from "utils/recruiting/recruits";
import { getContrastingTextColor } from "utils/ui/color";

function SchoolLogo({
  teamId,
  remoteUrl,
  league,
  isDark,
  size = 28,
}: {
  size?: number;
  teamId: number | null;
  remoteUrl?: string | null;
  league: "cfb" | "mcbb";
  isDark: boolean;
}) {
  const team =
    league === "cfb" ? getCFBTeam(teamId ?? "") : getMCBBTeam(teamId ?? "");
  const source = team
    ? league === "cfb"
      ? getCFBTeamLogo(teamId ?? "", isDark)
      : getMCBBTeamLogo(teamId ?? "", isDark)
    : remoteUrl
      ? { uri: remoteUrl }
      : PlaceholderLogo;
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessible={false}
    />
  );
}

export function RecruitRankingSummary({
  recruit,
  isDark,
  teamColor,
}: RecruitSectionProps & { teamColor?: string }) {
  const styles = StatCardStyles(isDark);
  const rank = getRecruitRanking(recruit, "industry");
  const backgroundColor = teamColor ?? Colors.midTone;
  const color = getContrastingTextColor(backgroundColor);
  return (
    <View>
      <CenteredHeader isDark={isDark}>
        {recruit.year} Recruiting Class
      </CenteredHeader>
      <View style={styles.card}>
        <View style={[styles.rankStrip, { backgroundColor }]} />
        <View style={styles.statsRow}>
          {[
            ["NATIONAL", rank.national],
            ["POSITION", rank.position],
            ["STATE", rank.state],
          ].map(([label, value]) => (
            <View key={label} style={styles.statItem}>
              <Text style={[styles.statRank, { color }]}>{label}</Text>
              <Text style={styles.statValue}>
                {value == null ? "—" : `#${value}`}
              </Text>
              <Text style={styles.statLabel}>INDUSTRY</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function RecruitRankingsPanel({
  recruit,
  isDark,
  league,
}: RecruitSchoolSectionProps) {
  const styles = RecruitProfileStyles(isDark);
  const hasCommitment =
    recruit.is_committed || recruit.is_signed || recruit.is_enrolled;
  const date = recruit.commitment_date
    ? formatDate(recruit.commitment_date)
    : null;
  return (
    <View style={styles.sections}>
      <View style={styles.section}>
        <HeadingTwo isDark={isDark}>Recruiting rankings</HeadingTwo>
        <View style={styles.table}>
          <View style={[styles.row, styles.altRow]}>
            {["Source", "Rating", "Nat.", "Pos.", "State"].map(
              (label, index) => (
                <Text
                  key={label}
                  style={[
                    styles.cell,
                    styles.tableLabel,
                    index === 0 && styles.sourceCell,
                  ]}
                >
                  {label}
                </Text>
              ),
            )}
          </View>
          {(["industry", "on3"] as const).map((source, index) => {
            const rank = getRecruitRanking(recruit, source);
            return (
              <View
                key={source}
                style={[styles.row, index % 2 === 1 && styles.altRow]}
              >
                <Text style={[styles.cell, styles.sourceCell]}>
                  {source === "industry" ? "Industry" : "On3"}
                </Text>
                <Text style={styles.cell}>
                  {formatRecruitRating(rank.rating)}
                </Text>
                {[rank.national, rank.position, rank.state].map((value, i) => (
                  <Text key={i} style={styles.cell}>
                    {value == null ? "—" : `#${value}`}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </View>
      <View>
        <HeadingTwo isDark={isDark}>Commitment</HeadingTwo>
        <View style={styles.commitmentCard}>
          {hasCommitment ? (
            <>
              <View style={styles.commitmentWatermark} pointerEvents="none">
                <SchoolLogo
                  teamId={recruit.committed_team_id}
                  remoteUrl={recruit.committed_school_logo_url}
                  league={league}
                  isDark={isDark}
                  size={220}
                />
              </View>
              <LinearGradient
                colors={
                  isDark
                    ? [
                        Colors.dark.itemBackground,
                        Colors.dark.itemBackground,
                        `${Colors.dark.itemBackground}00`,
                      ]
                    : [
                        Colors.light.itemBackground,
                        Colors.light.itemBackground,
                        "#eeeeee00",
                      ]
                }
                locations={[0, 0.5, 0.85]}
                start={{ x: 0, y: 0 }}
                end={{ x: .6, y: 0 }}
                style={styles.commitmentGradient}
                pointerEvents="none"
              />
              <View style={styles.commitmentInfo}>
                <Text style={styles.commitmentStatus}>
                  {getRecruitStatus(recruit)}
                </Text>
                <Text style={styles.commitmentSchool}>
                  {recruit.committed_team_name ?? "School unavailable"}
                </Text>
                {date && <Text style={styles.commitmentDate}>{date}</Text>}
              </View>
            </>
          ) : (
            <Text
              style={[styles.commitmentStatus, styles.commitmentStatusNeutral]}
            >
              {getRecruitStatus(recruit)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function RecruitSchoolsPanel({
  recruit,
  isDark,
  league,
}: RecruitSchoolSectionProps) {
  const styles = RecruitProfileStyles(isDark);
  const global = globalStyles(isDark);
  const header = PlayerHeaderStyles(isDark);
  const predictions = [...(recruit.predicted_schools ?? [])].sort(
    (a, b) => (b.percentage ?? -1) - (a.percentage ?? -1),
  );
  return (
    <View style={styles.section}>
      <HeadingTwo isDark={isDark}>Recruiting predictions</HeadingTwo>
      {recruit.interest_count != null && (
        <View style={header.infoRow}>
          <Text style={global.secondaryText}>School interests</Text>
          <Text style={styles.value}>{recruit.interest_count}</Text>
        </View>
      )}
      {predictions.length ? (
        <View style={styles.table}>
          <View style={[styles.row, styles.altRow]}>
            <Text style={[styles.schoolName, styles.tableLabel]}>SCHOOL</Text>
            <Text style={styles.tableLabel}>PREDICTION</Text>
          </View>
          {predictions.map((school, index) => (
            <View
              key={`${school.school_slug ?? school.team_name}-${index}`}
              style={[styles.row, index % 2 === 1 && styles.altRow]}
            >
              <View style={styles.school}>
                <SchoolLogo
                  teamId={school.team_id}
                  remoteUrl={school.image_url}
                  league={league}
                  isDark={isDark}
                />
                <Text style={styles.schoolName}>{school.team_name}</Text>
              </View>
              <Text style={styles.value}>
                {school.percentage == null
                  ? "—"
                  : `${formatRecruitRating(school.percentage)}%`}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={global.emptyText}>No predictions available</Text>
      )}
    </View>
  );
}

export function RecruitValuationPanel({
  recruit,
  isDark,
}: RecruitSectionProps) {
  const styles = RecruitProfileStyles(isDark);
  const global = globalStyles(isDark);
  const raw = recruit.nil_valuation;
  const value =
    raw != null && String(raw).trim() !== "" && Number.isFinite(Number(raw))
      ? Number(raw)
      : null;
  return (
    <View style={styles.section}>
      <HeadingTwo isDark={isDark}>NIL valuation</HeadingTwo>
      <View style={styles.valuationCard}>
        {value == null ? (
          <Text style={global.emptyText}>NIL valuation unavailable.</Text>
        ) : (
          <>
            <Text style={styles.valuation}>
              {value.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </Text>
            <Text style={styles.summaryCaption}>Estimated NIL valuation</Text>
          </>
        )}
      </View>
    </View>
  );
}
