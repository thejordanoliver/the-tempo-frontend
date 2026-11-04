import assert from "node:assert/strict";
import test from "node:test";
import { createTickerPreviewController } from "../services/ticker/preview";

test("preview controls update isolated state and keep status in sync", async () => {
  const first = createTickerPreviewController();
  const second = createTickerPreviewController();
  await first.controller.updateSetting({ type: "set_brightness", value: 30 });
  await first.controller.command({ type: "set_duration", value: 12 });
  await first.controller.command({ type: "set_team_schedule", value: 57 });
  await first.controller.rename("Office Ticker");
  await first.controller.command({ type: "set_date_format", value: "dd/mm" });
  await first.controller.command({ type: "set_show_broadcast", value: false });
  const state = first.controller.store.getState();
  assert.equal(state.settings?.brightness, 30);
  assert.equal(state.settings?.durationSeconds, 12);
  assert.equal(state.settings?.viewMode, "schedule");
  assert.equal(state.settings?.teamId, 57);
  assert.equal(state.settings?.dateFormat, "dd/mm");
  assert.equal(state.settings?.showBroadcast, false);
  assert.equal(
    second.controller.store.getState().settings?.dateFormat,
    "mm/dd",
  );
  assert.equal(
    second.controller.store.getState().settings?.showBroadcast,
    true,
  );
  assert.equal(state.status?.settings, state.settings);
  assert.equal(state.selectedDevice?.name, "Office Ticker");
  assert.equal(second.controller.store.getState().settings?.brightness, 75);
  assert.equal(
    second.controller.store.getState().selectedDevice?.name,
    "Living Room Ticker",
  );
});

test("locked and disconnected previews reject changes until unlocked or reconnected", async () => {
  const { controller, reset } = createTickerPreviewController();
  reset("locked");
  assert.equal(
    await controller.command({ type: "set_display", value: false }),
    false,
  );
  assert.equal(controller.store.getState().settings?.displayOn, true);
  await controller.authorize();
  assert.equal(
    await controller.command({ type: "set_display", value: false }),
    true,
  );
  await controller.disconnect();
  assert.equal(controller.store.getState().settings, null);
  assert.equal(
    await controller.command({ type: "set_view", value: "ap" }),
    false,
  );
  await controller.reconnect();
  assert.equal(controller.store.getState().connection, "connected");
  assert.equal(controller.store.getState().settings?.displayOn, true);
});

test("preview presets reset edits and expose offline state without changing another preview", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  await controller.command({ type: "set_view", value: "cfp" });
  await controller.updateSetting({ type: "set_league", value: "nba" });
  assert.equal(controller.store.getState().settings?.viewMode, "scores");
  assert.equal(controller.store.getState().settings?.teamId, null);
  reset("offline");
  assert.equal(controller.store.getState().settings?.selectedLeague, "cfb");
  assert.equal(controller.store.getState().status?.wifi, "disconnected");
  assert.equal(other.controller.store.getState().status?.wifi, "connected");
});

test("preview favorites activate independently and reset with the scenario", async () => {
  const { controller, reset } = createTickerPreviewController();
  assert.equal(
    await controller.showFavorites([
      { league: "nba", teamId: 1 },
      { league: "nfl", teamId: 1 },
    ]),
    true,
  );
  assert.equal(controller.store.getState().settings?.viewMode, "favorites");
  assert.ok(controller.store.getState().settings?.favoritesSignature);
  reset();
  assert.equal(controller.store.getState().settings?.viewMode, "scores");
  assert.equal(controller.store.getState().settings?.favoritesSignature, null);
});

test("preview header changes stay isolated and reset to THE TEMPO", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  assert.equal(
    await controller.command({ type: "set_header", value: "device_name" }),
    true,
  );
  assert.equal(controller.store.getState().settings?.headerMode, "device_name");
  await controller.rename("Office");
  assert.equal(controller.store.getState().selectedDevice?.name, "Office");
  await controller.command({ type: "set_header", value: "hidden" });
  assert.equal(controller.store.getState().settings?.headerMode, "hidden");
  assert.equal(other.controller.store.getState().settings?.headerMode, "tempo");
  reset();
  assert.equal(controller.store.getState().settings?.headerMode, "tempo");
});

test("preview header colors stay isolated, work with hidden headers and reset", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  await controller.command({ type: "set_header", value: "hidden" });
  await controller.command({ type: "set_header_color", value: "blue" });
  assert.equal(controller.store.getState().settings?.headerColor, "blue");
  assert.equal(controller.store.getState().settings?.headerMode, "hidden");
  assert.equal(
    other.controller.store.getState().settings?.headerColor,
    "green",
  );
  reset();
  assert.equal(controller.store.getState().settings?.headerColor, "green");
});

test("preview custom headings do not rename the device and reset with the scenario", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  assert.equal(await controller.setCustomHeader("🏆 Game Room 🔥"), true);
  assert.equal(controller.store.getState().customHeader, "🏆 Game Room 🔥");
  assert.equal(controller.store.getState().settings?.headerMode, "custom");
  assert.equal(
    controller.store.getState().selectedDevice?.name,
    "Living Room Ticker",
  );
  assert.equal(other.controller.store.getState().customHeader, "");
  reset();
  assert.equal(controller.store.getState().customHeader, "");
});

test("preview custom rotation saves independently, leaves for other content and resets", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  assert.equal(
    await controller.saveRotation([
      { league: "nba", view: "scores", teamId: null, seconds: 6 },
    ]),
    true,
  );
  assert.equal(controller.store.getState().settings?.viewMode, "rotation");
  assert.equal(controller.store.getState().rotationEntries?.length, 1);
  assert.deepEqual(other.controller.store.getState().rotationEntries, []);
  await controller.command({ type: "set_view", value: "scores" });
  assert.equal(controller.store.getState().settings?.rotationSignature, null);
  assert.equal(controller.store.getState().rotationEntries?.length, 1);
  reset();
  assert.deepEqual(controller.store.getState().rotationEntries, []);
});

test("preview smart priority updates independently and resets off", async () => {
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  assert.equal(
    await controller.command({ type: "set_smart_priority", value: true }),
    true,
  );
  assert.equal(controller.store.getState().settings?.smartGamePriority, true);
  assert.equal(
    other.controller.store.getState().settings?.smartGamePriority,
    false,
  );
  await controller.command({ type: "set_view", value: "ap" });
  assert.equal(controller.store.getState().settings?.smartGamePriority, true);
  reset();
  assert.equal(controller.store.getState().settings?.smartGamePriority, false);
});

test("quiet-hours preview saves and overrides independently, then resets", async () => {
  const { DEFAULT_QUIET_HOURS } = await import("../services/ticker/quietHours");
  const { controller, reset } = createTickerPreviewController();
  const other = createTickerPreviewController();
  assert.equal(
    await controller.setQuietHours({
      ...DEFAULT_QUIET_HOURS,
      enabled: true,
      behavior: "dim",
    }),
    true,
  );
  assert.equal(controller.store.getState().settings?.quietHoursEnabled, true);
  assert.equal(
    await controller.command({ type: "set_quiet_override", value: true }),
    true,
  );
  assert.equal(controller.store.getState().settings?.quietHoursOverride, true);
  assert.equal(
    other.controller.store.getState().settings?.quietHoursEnabled,
    false,
  );
  reset();
  assert.equal(controller.store.getState().quietHoursConfigured, false);
  assert.equal(controller.store.getState().settings?.quietHoursOverride, false);
});
