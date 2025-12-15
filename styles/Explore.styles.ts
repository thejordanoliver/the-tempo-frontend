import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },

  itemContainer: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemContainerDark: {
    borderBottomColor: Colors.darkGray,
  },
  teamName: {
    fontSize: 16,
    fontFamily: Fonts.OSLIGHT,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: Colors.midTone,
  },
  playerInfo: {},
  playerName: {
    fontSize: 16,
    fontFamily: Fonts.OSLIGHT,
  },
  playerTeam: {
    fontSize: 16,
    fontFamily: Fonts.OSLIGHT,
    color: Colors.darkGray,
    opacity: 0.5,
  },
  textDark: {
    color: Colors.white,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: Colors.midTone,
  },
  errorText: {
    color: Colors.light.red,
    textAlign: "center",
  },
  errorTextDark: {
    color: Colors.dark.lightRed,
  },
  centerPrompt: {
    flex: 1,
    marginTop: 80,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  nbaLogo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 24,
    fontFamily: Fonts.OSREGULAR,
    color: Colors.darkGray,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {},
  userName: {
    fontSize: 16,
    fontFamily: Fonts.OSLIGHT,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midTone,
  },
});
