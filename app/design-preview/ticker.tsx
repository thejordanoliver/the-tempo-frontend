import { useTickerTheme } from "hooks/TickerHooks/useTickerTheme";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import PillTabs from "components/TabBars/PillTabs";
import TickerSettingsView from "components/Ticker/TickerSettingsView";
import { TickerAction, TickerCard } from "components/Ticker/TickerUI";
import {
  createTickerPreviewController,
  type TickerPreviewScenario,
} from "services/ticker/preview";
import { TickerControllerContext } from "store/tickerStore";

export default function TickerPreviewScreen() {
  if (!__DEV__) return <Redirect href="/settings" />;
  return <TickerPreview />;
}

function TickerPreview() {
  const [{ controller, reset }] = useState(createTickerPreviewController);
  const [scenario, setScenario] = useState<TickerPreviewScenario>("ready");
  const { text } = useTickerTheme();
  return (
    <TickerControllerContext.Provider value={controller}>
      <TickerSettingsView title="Ticker Preview">
        <TickerCard>
          <Text style={text.subtitle}>Ticker design preview</Text>
          <Text style={text.secondaryText}>
            Try the real controls, pickers, and rename dialog with sample data.
            Changes stay in this preview. Use Preferences to check each theme.
          </Text>
          <PillTabs
            tabs={[
              { label: "Ready", value: "ready" },
              { label: "Locked", value: "locked" },
              { label: "Wi-Fi off", value: "offline" },
              { label: "Disconnected", value: "disconnected" },
            ]}
            selectedValue={scenario}
            onChange={(value) => {
              const next = value as TickerPreviewScenario;
              setScenario(next);
              reset(next);
            }}
          />
          <TickerAction
            label="Reset preview"
            secondary
            onPress={() => reset(scenario)}
          />
        </TickerCard>
      </TickerSettingsView>
    </TickerControllerContext.Provider>
  );
}
