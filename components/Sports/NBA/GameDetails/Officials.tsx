import HeadingTwo from "components/Headings/HeadingTwo";
import { FlatList, Text, View } from "react-native";
import { officialsStyles } from "styles/GameDetailStyles/OfficialsStyles";

type Official = {
  displayName: string;
  position?: {
    displayName: string;
  };
};

type Props = {
  officials: Official[];
  isDark: boolean;
};

export default function Officials({ officials, isDark }: Props) {
  const styles = officialsStyles(isDark);

  if (!officials || officials.length === 0) return null;

  return (
    <View>
      <HeadingTwo isDark={isDark}>Game Officials</HeadingTwo>
      <View style={styles.wrapper}>
        <FlatList
          data={officials}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const initials = item.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            const isLast = index === officials.length - 1;

            return (
              <View
                style={[
                  styles.row,
                  isLast && { borderBottomWidth: 0 }, // ✅ remove divider
                ]}
              >
                <View style={styles.placeholder}>
                  <Text style={styles.initials}>{initials}</Text>
                </View>

                <View style={styles.nameContainer}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.position}>
                    {item.position?.displayName ?? "Official"}
                  </Text>
                </View>
              </View>
            );
          }}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
