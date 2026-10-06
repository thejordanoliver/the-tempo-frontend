import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import type { DefaultMessagingApp } from "services/defaultMessagingApp";

export default function MessagingAppIcon({
  app,
}: {
  app: DefaultMessagingApp | null;
}) {
  if (Platform.OS === "android" && app?.iconUri) {
    return (
      <Image
        source={{ uri: app.iconUri }}
        style={styles.icon}
        contentFit="contain"
      />
    );
  }
  if (Platform.OS === "ios") {
    // The Expo SMS composer uses the system Messages UI on iOS.
    return (
      <Svg width={44} height={44} viewBox="0 0 44 44" style={styles.icon}>
        <Defs>
          <LinearGradient id="messagesGreen" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#67E568" />
            <Stop offset="1" stopColor="#21BA45" />
          </LinearGradient>
        </Defs>
        <Circle cx={22} cy={22} r={22} fill="url(#messagesGreen)" />
        <Path
          d="M22 9C12.6 9 6 14.4 6 21c0 4.1 2.6 7.7 6.5 9.8L10.5 36l7-3.6c1.4.4 2.9.6 4.5.6 9.4 0 16-5.4 16-12S31.4 9 22 9Z"
          fill={Colors.white}
        />
      </Svg>
    );
  }
  return (
    <View style={[, styles.fallback]}>
      <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.blue,
  },
});
