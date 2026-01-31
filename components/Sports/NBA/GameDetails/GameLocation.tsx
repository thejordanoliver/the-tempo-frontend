import { Ionicons } from "@expo/vector-icons";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/Styles";
import { WeatherData } from "hooks/useWeather";
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
import GameLocationSkeleton from "../../../Skeletons/GameDetails/GameLocationSkeleton";

type Props = {
  weather: WeatherData | null;
  venueImage?: any;
  venueName?: string;
  location?: string;
  loading: boolean;
  error: string | null;
  address?: string;
  venueCapacity: string;
  venueAttendance?: number | string;
  lighter?: boolean;
  surface?: "football" | "default";
  grass?: boolean; // <-- new prop
};

const GameLocation: React.FC<Props> = ({
  weather,
  venueImage,
  venueName,
  location,
  address,
  venueCapacity,
  venueAttendance,
  loading,
  error,
  lighter = false,
  surface = "default",
  grass,
}) => {
  const isDark = useColorScheme() === "dark";
  const styles = gameLocationStyles(isDark, lighter);
  const desc = weather?.main.toLowerCase();

  const getWeatherIcon = (desc?: string) => {
    if (!desc) return "cloud";

    if (desc.includes("clear")) return "sunny";
    if (desc.includes("cloud")) return "cloud";
    if (desc.includes("rain")) return "rainy";
    if (desc.includes("drizzle")) return "rainy";
    if (desc.includes("thunder")) return "thunderstorm";
    if (desc.includes("snow")) return "snow";
    if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze"))
      return "cloudy";
    if (desc.includes("wind")) return "leaf";

    return "cloud";
  };

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
    <View>
      <HeadingTwo lighter={lighter}>Location</HeadingTwo>

      {loading && !error ? (
        <GameLocationSkeleton />
      ) : (
        <View style={styles.container}>
          <View style={styles.wrapper}>
            {venueImage && (
              <Image
                source={
                  typeof venueImage === "string"
                    ? { uri: venueImage }
                    : venueImage
                }
                style={styles.venueImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.textContainer}>
              <Text style={styles.venueTitle}>{venueName}</Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="location" size={20} color={styles.icon.color} />
              {address && (
                <TouchableOpacity onPress={openInMaps}>
                  <Text style={[styles.subText]}>{address}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.addressContainer}>
              <Ionicons
                name={getWeatherIcon(desc)}
                size={20}
                color={styles.icon.color}
              />
              <Text style={styles.subText}>
                Temperature:{" "}
                {weather?.tempFahrenheit != null
                  ? `${weather.tempFahrenheit.toFixed(0)}°F`
                  : "--"}
              </Text>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons name="person" size={20} color={styles.icon.color} />
              <Text style={styles.subText}>
                Capacity: {venueCapacity || "N/A"}
              </Text>
            </View>

            {venueAttendance !== null &&
              venueAttendance !== undefined &&
              !isNaN(Number(venueAttendance)) && (
                <View style={styles.addressContainer}>
                  <Ionicons name="person" size={20} color={styles.icon.color} />
                  <Text style={styles.subText}>
                    Attendance:{" "}
                    {Intl.NumberFormat("en-US").format(Number(venueAttendance))}
                  </Text>
                </View>
              )}

            {/* Grass indicator */}
            {typeof grass === "boolean" && (
              <View style={styles.addressContainer}>
                <Ionicons name="leaf" size={20} color={styles.icon.color} />
                <Text style={styles.subText}>
                  {grass ? "Natural Grass" : "Artificial Turf"}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const gameLocationStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {},
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
    },
    venueImage: { width: "100%", height: 200 },
    text: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 20,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      opacity: 0.5,
      marginLeft: 8,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    venueTitle: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      paddingTop: 12,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    icon: {
      width: 54,
      height: 54,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    textContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 12,
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 8,
      paddingHorizontal: 12,
    },
  });

export default GameLocation;
