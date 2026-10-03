import { Image } from "expo-image";
import { Text, View } from "react-native";
import type { ConversationScreenStyles } from "styles/MessageStyles/ConversationScreenStyles";

type Props = {
  styles: ReturnType<typeof ConversationScreenStyles>;
  isOtherUserTyping: boolean;
  displayAvatar: string;
  displayUsername: string;
};

export default function ConversationTypingIndicator({
  styles,
  isOtherUserTyping,
  displayAvatar,
  displayUsername,
}: Props) {
  if (!isOtherUserTyping) return null;

  return (
    <View style={[styles.messageRow, styles.otherUserRow]}>
      <Image
        source={{ uri: displayAvatar }}
        style={styles.messageAvatar}
        contentFit="cover"
      />

      <View
        style={[
          styles.messageBubble,
          styles.otherUserBubble,
          styles.typingBubble,
        ]}
      >
        <Text style={styles.typingBubbleText}>
          {displayUsername} is typing...
        </Text>
      </View>
    </View>
  );
}
