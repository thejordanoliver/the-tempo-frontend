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
      <View style={styles.container}>
        <ActivityIndicator size="small" color={lighter ? "#fff" : undefined} />
        <Text style={styles.loadingText}>Loading officials...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load officials</Text>
      </View>
    );
  }

  if (!officials || officials.length === 0) return null;

  // ensure even number of cells
  const officialsData =
    officials.length % 2 === 0
      ? officials
      : [...officials, { displayName: "", position: { displayName: "" } }];

  return (
    <View style={styles.container}>
      <HeadingTwo lighter={lighter}>Game Officials</HeadingTwo>
      <FlatList
        data={officialsData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          if (!item.displayName)
            return <View style={[styles.card, styles.emptyCard]} />;

          const initials = item.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <View style={styles.card}>
              <View style={styles.placeholder}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
              <Text style={styles.position}>
                {item.position?.displayName ?? "Official"}
              </Text>
              <Text style={styles.name}>{item.displayName}</Text>
            </View>
          );
        }}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const getStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 20,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: 14,
    },
    card: {
      width: "48%",
      padding: 12,
      borderRadius: 10,
      backgroundColor: lighter
        ? "rgba(255,255,255,0.1)"
        : isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 2,
      alignItems: "center",
    },
    emptyCard: {
      backgroundColor: "transparent",
    },
    placeholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: lighter
        ? Colors.midTone
        : isDark
        ? Colors.darkGray
        : Colors.lightGray,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    initials: {
      color: Colors.white,
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
    },
    position: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: lighter
        ? Colors.midTone
        : isDark
        ? Colors.darkGray
        : Colors.midTone,
      marginBottom: 4,
      textAlign: "center",
    },
    name: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      textAlign: "center",
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
