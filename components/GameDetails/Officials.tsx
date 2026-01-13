import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import HeadingTwo from "../Headings/HeadingTwo";

type Official = {
  displayName: string;
  position?: {
    displayName: string;
  };
};

type Props = {
  officials: Official[];
  loading: boolean;
  error: any;
  lighter?: boolean;
};

export default function Officials({
  officials,
  loading,
  error,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark, lighter);

  if (loading) {
    return (
      <View>
        <ActivityIndicator
          size="small"
          color={lighter ? Colors.white : undefined}
        />
        <Text style={styles.loadingText}>Loading officials...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text style={styles.errorText}>Failed to load officials</Text>
      </View>
    );
  }

  if (!officials || officials.length === 0) return null;

  return (
    <View>
      <HeadingTwo lighter={lighter}>Game Officials</HeadingTwo>
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

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    row: {
      flex: 1,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.midTone
        : isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    nameContainer: {
      marginLeft: 8,
      flex: 1,
    },
    placeholder: {
      width: 50,
      height: 50,
      borderRadius: 100,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },
    initials: {
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
    },
    position: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: lighter ? Colors.white : Colors.black,
    },
    errorText: {
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
