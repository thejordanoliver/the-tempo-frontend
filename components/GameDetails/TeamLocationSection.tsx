import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import HeadingTwo from "../Headings/HeadingTwo";
import TeamLocationSkeleton from "./TeamLocationSkeleton";

type Props = {
  venueImage?: any;
  venueName?: string;
  location?: string;
  loading: boolean;
  error: string | null;
  address: string;
  venueCapacity: string;
  venueAttendancee?: number | string;
  lighter?: boolean;
  surface?: "football" | "default";
  grass?: boolean; // <-- new prop
};

const TeamLocationSection: React.FC<Props> = ({
  venueImage,
  venueName,
  location,
  address,
  venueCapacity,
  venueAttendancee,
  loading,
  error,
  lighter = false,
  surface = "default",
  grass,
}) => {
  const isDark = useColorScheme() === "dark";
  const textColor = lighter
    ? Colors.white
    : isDark
    ? Colors.white
    : Colors.black;

  // Early return if values are missing or marked "Unknown"
  if (
    !venueName ||
    !location ||
    venueName.trim() === "" ||
    location.trim() === "" ||
    venueName === "Unknown" ||
    location === "Unknown"
  ) {
    return null;
  }

  const openInMaps = async () => {
    if (!address) return;
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodedAddress}`,
      android: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });

    if (!url) return;

    Alert.alert(
      "Open in Maps?",
      `Do you want to open this location in your Maps app?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                console.warn("Maps app is not available.");
              }
            } catch (err) {
              console.error("Failed to open maps:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginTop: 20 }}>
      <HeadingTwo lighter={lighter}>Location</HeadingTwo>

      {loading && !error ? (
        <TeamLocationSkeleton />
      ) : (
        <View style={styles.container}>
          <Image
            source={
              typeof venueImage === "string" ? { uri: venueImage } : venueImage
            }
            style={styles.venueImage}
            resizeMode="cover"
          />

          <View style={styles.textContainer}>
            <Text style={[styles.venueTitle, { color: textColor }]}>
              {venueName}
            </Text>
          </View>

          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color={textColor} />
            {address && (
              <TouchableOpacity onPress={openInMaps}>
                <Text
                  style={[styles.subText, { color: textColor, marginLeft: 8 }]}
                >
                  {address}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.addressContainer}>
            <Ionicons name="person" size={20} color={textColor} />
            <Text style={[styles.subText, { color: textColor, marginLeft: 8 }]}>
              Capacity: {venueCapacity || "N/A"}
            </Text>
          </View>

          {venueAttendancee !== null &&
            venueAttendancee !== undefined &&
            !isNaN(Number(venueAttendancee)) && (
              <View style={styles.addressContainer}>
                <Ionicons name="person" size={20} color={textColor} />
                <Text
                  style={[styles.subText, { color: textColor, marginLeft: 8 }]}
                >
                  Attendance:{" "}
                  {Intl.NumberFormat("en-US").format(Number(venueAttendancee))}
                </Text>
              </View>
            )}

          {/* Grass indicator */}
          {typeof grass === "boolean" && (
            <View style={styles.addressContainer}>
              <Ionicons name="leaf" size={20} color={textColor} />
              <Text
                style={[styles.subText, { color: textColor, marginLeft: 8 }]}
              >
                {grass ? "Natural Grass" : "Artificial Turf"}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  venueImage: { width: "100%", height: 200, borderRadius: 8 },
  text: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
  },
  subText: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 16,
    opacity: 0.5,
  },
  venueTitle: {
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
    paddingVertical: 10,
  },
  icon: {
    width: 54,
    height: 54,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
});

export default TeamLocationSection;
