import { TransactionsStyles } from "@/styles/LeagueStyles/TransactionsStyles";
import { formatDate } from "@/utils/common/dateUtils";
import { Image, Text, View } from "react-native";
import type { LeagueTransaction } from "types/transactions";

export type TransactionItemProps = {
  data: LeagueTransaction;
  isDark: boolean;
};

export default function TransactionItem({
  isDark,
  data,
}: TransactionItemProps) {
  const styles = TransactionsStyles(isDark);
  const description = data.description;
  const formattedDate = formatDate(data.date);
  const logo = isDark
    ? (data.team?.logoDark ?? data.team?.logo)
    : data.team?.logo;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.teamRow}>
        <View style={styles.logoContainer}>
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text style={styles.teamName}>
          {data.team?.name ??
            (data.teamId ? `Team ${data.teamId}` : "Unknown team")}
        </Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.formattedDate}>{formattedDate}</Text>
    </View>
  );
}
