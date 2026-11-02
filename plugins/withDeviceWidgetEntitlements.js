const { withEntitlementsPlist } = require("expo/config-plugins");

module.exports = function withDeviceWidgetEntitlements(config) {
  const widgets = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-widgets",
  );

  if (!widgets || widgets[1]?.enablePushNotifications === true) return config;

  // expo-widgets 57.0.27 adds aps-environment even when push updates are off.
  // Entitlement mods run in reverse registration order: list this plugin before
  // expo-widgets so this action runs last. Keep the required App Group intact.
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults["aps-environment"];
    return mod;
  });
};
