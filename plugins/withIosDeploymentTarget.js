const { withPodfile, withXcodeProject } = require("expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

// Expo applies ios.deploymentTarget to the app target and Podfile platform,
// but leaves project defaults and individual pod targets at their own minima.
module.exports = function withIosDeploymentTarget(config) {
  const deploymentTarget = config.ios?.deploymentTarget;
  if (!deploymentTarget || !/^\d+\.\d+$/.test(deploymentTarget)) {
    throw new Error("Set ios.deploymentTarget to a version such as 17.0.");
  }

  config = withXcodeProject(config, (mod) => {
    const configurations = mod.modResults.pbxXCBuildConfigurationSection();
    for (const configuration of Object.values(configurations)) {
      const settings = configuration.buildSettings;
      if (
        settings?.IPHONEOS_DEPLOYMENT_TARGET &&
        Number(settings.IPHONEOS_DEPLOYMENT_TARGET) < Number(deploymentTarget)
      ) {
        settings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
      }
    }
    return mod;
  });

  return withPodfile(config, (mod) => {
    mod.modResults.contents = mergeContents({
      tag: "tempo-ios-deployment-target",
      src: mod.modResults.contents,
      // Run before React Native's post_install, which preserves higher targets.
      anchor: /^\s+react_native_post_install\(/m,
      offset: 0,
      comment: "#",
      newSrc: `    minimum_ios_version = Gem::Version.new('${deploymentTarget}')
    configurations = installer.pods_project.build_configurations +
      installer.pods_project.targets.flat_map(&:build_configurations)
    configurations.each do |configuration|
      current = configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
      if current.nil? || Gem::Version.new(current.to_s) < minimum_ios_version
        configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum_ios_version.to_s
      end
    end`,
    }).contents;
    return mod;
  });
};
