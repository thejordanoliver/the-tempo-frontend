import { Colors, Fonts } from "@/constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type FighterBioProps = {
  id: string | number;
  stanceImage: string;
  name: string | null;
  flag: string;
  record: string;
  isDark: boolean;
  isChampion: boolean | null;
  isWinner: boolean;
};

export const FighterBio = ({
  id,
  stanceImage,
  name,
  flag,
  record,
  isDark,
  isChampion,
}: FighterBioProps) => {
  const router = useRouter();
  const styles = FighterBioStyles(isDark);
  const route = "/player/mma/[id]";

  const handleTeamPress = () => {
    if (id)
      router.push({
        pathname: route,
        params: {
          id: id,
        },
      });
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.container}>
      <Pressable onPress={handleTeamPress}>
        {isChampion && <View style={styles.topInfo}></View>}
        <Image source={{ uri: stanceImage }} style={styles.stanceImage} />

        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>{name}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const FighterBioStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignContent: "center",
      flex: 0.4,
    },
    wrapper: {
      alignContent: "center",
    },
    stanceImage: {
      height: 175,
      width: "100%",
      resizeMode: "contain",
    },
    topInfo: {
      justifyContent: "center",
    },
    bottomInfo: {
      justifyContent: "center",
    },
    bottomInfoText: {
      fontSize:  12,
      textAlign: "center",
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
  });
