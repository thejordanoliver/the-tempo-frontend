import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Modal, Text, View } from "react-native";
import ForegroundNotificationBanner from "components/Notifications/ForegroundNotificationBanner";
import PillTabs from "components/TabBars/PillTabs";
import TextInputComponent from "components/TextInput";
import {
  TickerAction,
  TickerCard,
  TickerPage,
} from "components/Ticker/TickerUI";
import { DESIGN_PREVIEW_NOTIFICATIONS } from "constants/designPreviewNotifications";

export default function NotificationBannerPreviewScreen() {
  if (!__DEV__) return <Redirect href="/settings" />;
  return <NotificationBannerPreview />;
}

function NotificationBannerPreview() {
  const { text } = useTickerTheme();
  const [notification, setNotification] = useState(
    DESIGN_PREVIEW_NOTIFICATIONS[0].notification,
  );
  const [visible, setVisible] = useState(true);
  const [overlay, setOverlay] = useState(false);
  const [replay, setReplay] = useState(0);
  const [timedExit, setTimedExit] = useState(false);
  return (
    <>
      <TickerPage title="Notification Banner Preview">
        <Text style={text.subtitle}>Notification banners</Text>
        <Text style={text.secondaryText}>
          Switch examples and edit the copy to check wrapping, logos, and
          spacing. Use Preferences to check each theme.
        </Text>
        <PillTabs
          tabs={DESIGN_PREVIEW_NOTIFICATIONS.map(
            ({ label, notification: item }) => ({ label, value: item.id }),
          )}
          selectedValue={notification.id}
          onChange={(id) => {
            const sample = DESIGN_PREVIEW_NOTIFICATIONS.find(
              (item) => item.notification.id === id,
            );
            if (sample) setNotification(sample.notification);
            setTimedExit(false);
            setVisible(true);
            setReplay((value) => value + 1);
          }}
        />
        {visible ? (
          <ForegroundNotificationBanner
            key={replay}
            previewNotification={notification}
            inline
            autoDismissAfterMs={timedExit ? 2000 : undefined}
            onPreviewDismiss={() => setVisible(false)}
          />
        ) : (
          <Text style={text.secondaryText}>
            Banner dismissed. Replay to show it again.
          </Text>
        )}
        <TickerCard>
          <Text style={text.label}>Title</Text>
          <TextInputComponent
            accessibilityLabel="Preview notification title"
            value={notification.title}
            onChangeText={(title) =>
              setNotification((item) => ({ ...item, title }))
            }
          />
          <Text style={text.label}>Message</Text>
          <TextInputComponent
            accessibilityLabel="Preview notification message"
            multiline
            value={notification.body}
            onChangeText={(body) =>
              setNotification((item) => ({ ...item, body }))
            }
          />
          <TickerAction
            label="Replay banner"
            secondary
            onPress={() => {
              setTimedExit(false);
              setVisible(true);
              setReplay((value) => value + 1);
            }}
          />
          <TickerAction
            label="Preview auto-dismiss"
            secondary
            onPress={() => {
              setTimedExit(true);
              setVisible(true);
              setReplay((value) => value + 1);
            }}
          />
          <TickerAction
            label="Show as top banner"
            onPress={() => setOverlay(true)}
          />
        </TickerCard>
      </TickerPage>
      <Modal
        transparent
        visible={overlay}
        statusBarTranslucent
        onRequestClose={() => setOverlay(false)}
      >
        <View style={{ flex: 1 }}>
          <ForegroundNotificationBanner
            key={`overlay-${replay}`}
            previewNotification={notification}
            autoDismissAfterMs={5000}
            onPreviewDismiss={() => setOverlay(false)}
          />
        </View>
      </Modal>
    </>
  );
}
