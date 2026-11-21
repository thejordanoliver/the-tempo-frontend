import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const MessageImageViewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparentBlack,
  },
  toolbar: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
  },
  image: {
    flex: 1,
    width: "100%",
  },
});
