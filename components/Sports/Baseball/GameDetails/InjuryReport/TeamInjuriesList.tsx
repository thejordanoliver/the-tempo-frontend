import { globalStyles } from "@/constants/styles";
import { Injury } from "@/hooks/FootballHooks/useFootballGameDetails";
import { FlatList, Text, View } from "react-native";
import InjuryRow from "./InjuryRow";

type Props = {
  injuries: Injury[];
  isDark: boolean;
};

export default function TeamInjuriesList({ injuries, isDark }: Props) {
  const global = globalStyles(isDark);

  return (
    <FlatList
      data={injuries}
      keyExtractor={(injury, index) =>
        `${injury.athlete?.id ?? "unknown"}-${index}`
      }
      renderItem={({ item, index }) => (
        <InjuryRow
          injury={item}
          player={item.athlete}
          isLast={index === injuries.length - 1}
          isDark={isDark}
        />
      )}
      scrollEnabled={false}
      removeClippedSubviews={false}
      ListEmptyComponent={
        <View style={global.emptyContainer}>
          <Text style={global.emptyText}>
            No injuries reported for this team.
          </Text>
        </View>
      }
    />
  );
}
