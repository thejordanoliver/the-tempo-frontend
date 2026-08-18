import ConversationItem from "components/Messages/ConversationItem";
import { memo } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import type { MessageItem } from "types/messages";

type Props = {
  item: MessageItem;
  query: string;
  onSelect: (item: MessageItem) => void;
  onDelete: (item: MessageItem) => void;
  onTogglePin: (item: MessageItem) => void;
  onSwipeableOpen: (id: string, close: () => void) => void;
};

function MessageListItem({
  item,
  query,
  onSelect,
  onDelete,
  onTogglePin,
  onSwipeableOpen,
}: Props) {
  return (
    <Animated.View
      collapsable={false}
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.duration(180)}
    >
      <ConversationItem
        item={item}
        query={query}
        onSelect={onSelect}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        onSwipeableOpen={onSwipeableOpen}
      />
    </Animated.View>
  );
}

export default memo(MessageListItem);