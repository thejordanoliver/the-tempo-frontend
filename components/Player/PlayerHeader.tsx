import type { BasketballLeague } from "hooks/BasketballHooks/usePlayerSeasons";
import { Fragment } from "react";
import { Image, Text, View } from "react-native";
import { playerHeaderStyles } from "styles/PlayerStyles/PlayerHeaderStyles";
import type { RosterPlayer } from "types/roster";
import { calculateAge, formatBirth } from "utils/common/dateUtils";

type HeaderPlayer = Partial<RosterPlayer> & {
  nickname?: string | null;
  weight_class_short_name?: string | null;
  association_name?: string | null;
  stance_text?: string | null;
  style_text?: string | null;
};

type Props = {
  player: HeaderPlayer | null;
  isDark: boolean;
} & (
  | { sport: "basketball"; league: BasketballLeague }
  | { sport: "football"; league: "nfl" | "cfb" }
  | { sport: "baseball" | "hockey" | "soccer" | "racing" | "mma" }
);

type HeaderRow = {
  label: string;
  value: string | number | null | undefined;
  truncate?: boolean;
};

function getHeaderRows(props: Props, player: HeaderPlayer) {
  const age = calculateAge(player.birth_date);
  const birthDate = formatBirth(player.birth_date ?? null);
  const experience = player.experience === 0 ? "R" : player.experience;
  const draftInfo =
    player.draft_round && player.draft_number && player.draft_year
      ? `Rd ${player.draft_round}, Pick ${player.draft_number} · ${player.draft_year}`
      : "Undrafted";

  const stats: HeaderRow[] = [
    {
      label: "HEIGHT",
      value: props.sport === "football" ? player.height : (player.height ?? "—"),
    },
    {
      label: "LBS",
      value: props.sport === "football" ? player.weight : (player.weight ?? "—"),
    },
  ];
  const info: HeaderRow[] = [];
  const ageRow: HeaderRow = { label: "AGE", value: age };
  const experienceRow: HeaderRow = { label: "YRS EXP", value: experience };
  const birthRow: HeaderRow = { label: "BORN", value: birthDate };
  const draftRow: HeaderRow = { label: "DRAFT", value: draftInfo };
  const hometownRow: HeaderRow = {
    label: "HOMETOWN",
    value: player.birth_display ?? "Unknown",
    truncate: true,
  };

  switch (props.sport) {
    case "basketball": {
      const isPro = props.league === "nba" || props.league === "wnba";
      if (isPro) {
        if (age != null) stats.push(ageRow);
        if (experience != null) stats.push(experienceRow);
        info.push(
          { label: "COLLEGE", value: player.college, truncate: true },
          birthRow,
          draftRow,
        );
      } else {
        const playerClass = player.experience === 0 ? "R" : player.experience_abbr;
        if (playerClass != null) {
          stats.push({ label: "CLASS", value: playerClass });
        }
        info.push(hometownRow);
      }
      break;
    }
    case "football": {
      const isCollege = props.league === "cfb";
      if (isCollege) {
        stats.push({ label: "CLASS", value: player.experience_abbr ?? "-" });
        info.push(hometownRow);
      } else {
        if (age != null) stats.push(ageRow);
        if (experience != null) stats.push(experienceRow);
        info.push({
          label: "COLLEGE",
          value: player.college ?? "Unknown",
          truncate: true,
        });
      }
      if (birthDate) info.push(birthRow);
      if (!isCollege) info.push(draftRow);
      break;
    }
    case "baseball":
    case "hockey":
      stats.push(ageRow, experienceRow);
      info.push(birthRow, draftRow);
      break;
    case "soccer":
    case "racing":
      stats.push(ageRow);
      info.push(hometownRow, birthRow);
      break;
    case "mma":
      stats.push(ageRow);
      info.push(
        birthRow,
        { label: "ASSOCIATION", value: player.association_name },
        { label: "STANCE", value: player.stance_text },
        { label: "FIGHT STYLE", value: player.style_text },
      );
      break;
  }

  return { stats, info };
}

export default function PlayerHeader(props: Props) {
  const { isDark, sport } = props;
  const player = props.player ?? {};
  const styles = playerHeaderStyles(isDark);
  const { stats, info } = getHeaderRows(props, player);
  const showAvatarPlaceholder = sport !== "baseball" && sport !== "hockey";
  const initial = player.first_name?.[0]?.toUpperCase() || "?";
  const name =
    sport === "mma"
      ? `${player.first_name ?? ""} ${player.nickname ? `"${player.nickname}" ` : ""}${player.last_name ?? ""}`
      : `${player.first_name ?? ""} ${player.last_name ?? ""}`;
  const badge =
    sport === "mma"
      ? (player.weight_class_short_name ?? "UNK")
      : `${player.position ?? "?"}${sport === "football" ? " ·" : ""} #${player.jersey_number ?? "?"}`;
  const positionBadge = (
    <View style={styles.positionBadge}>
      <Text style={styles.positionText}>{badge}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {player.headshot_url ? (
          <Image
            source={{ uri: player.headshot_url }}
            style={styles.avatar}
            accessibilityLabel={`${sport === "mma" ? player.full_name : name} photo`}
          />
        ) : showAvatarPlaceholder ? (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        ) : null}
      </View>
      {sport === "football" ? (
        positionBadge
      ) : (
        <View style={styles.badgeRow}>{positionBadge}</View>
      )}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.statsRow}>
        {stats.map(({ label, value }, index) => (
          <Fragment key={label}>
            {index > 0 && <View style={styles.statDivider} />}
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </Fragment>
        ))}
      </View>
      <View style={styles.infoGrid}>
        {info.map(({ label, value, truncate }) => (
          <View style={styles.infoRow} key={label}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={truncate ? 1 : undefined}
              ellipsizeMode={truncate ? "tail" : undefined}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
