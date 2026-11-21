const [major, minor] = require("react-native-reanimated/package.json")
  .version.split(".")
  .map(Number);

const AFFECTED_LIBRARIES =
  /\/node_modules\/(?:@gorhom\/bottom-sheet|react-native-draggable-flatlist)\//;
const DEPENDENCY_ARGUMENT = {
  useAnimatedStyle: 1,
  useAnimatedProps: 1,
  useDerivedValue: 1,
  useAnimatedReaction: 2,
  useAnimatedScrollHandler: 1,
  useHandler: 1,
};

function importedHook(call) {
  const callee = call.get("callee");
  const identifier = callee.isIdentifier()
    ? callee
    : callee.isMemberExpression() && callee.get("object").isIdentifier()
      ? callee.get("object")
      : null;
  const binding = identifier && call.scope.getBinding(identifier.node.name);
  if (
    !binding ||
    !binding.path.parentPath.isImportDeclaration() ||
    binding.path.parentPath.node.source.value !== "react-native-reanimated"
  ) {
    return null;
  }
  if (callee.isIdentifier() && binding.path.isImportSpecifier()) {
    const imported = binding.path.node.imported;
    return imported.name ?? imported.value;
  }
  if (
    callee.isMemberExpression() &&
    binding.path.isImportNamespaceSpecifier()
  ) {
    const property = callee.get("property");
    return callee.node.computed
      ? property.isStringLiteral() && property.node.value
      : property.isIdentifier() && property.node.name;
  }
  return null;
}

// Reanimated 4.6+ ignores these arguments on native. Keep the libraries' web
// dependency tracking and their worklet callbacks intact until upstream fixes
// https://github.com/gorhom/react-native-bottom-sheet/issues/2785 land.
module.exports = function nativeReanimatedDependencies({ types }) {
  return {
    name: "tempo-native-reanimated-dependencies",
    pre(file) {
      this.patchNativeDependencies =
        major === 4 &&
        minor >= 6 &&
        ["ios", "android"].includes(file.opts.caller?.platform) &&
        AFFECTED_LIBRARIES.test((file.opts.filename ?? "").replace(/\\/g, "/"));
    },
    visitor: {
      CallExpression(call, state) {
        if (!state.patchNativeDependencies) return;
        const index = DEPENDENCY_ARGUMENT[importedHook(call)];
        if (index === undefined) return;
        const argument = call.get("arguments")[index];
        if (
          !argument?.node ||
          argument.isSpreadElement() ||
          argument.isUnaryExpression({ operator: "void" })
        ) {
          return;
        }
        // Preserve evaluation order and any getters/side effects in the old
        // argument, while passing undefined to the native hook. Later arguments
        // (such as animated-props adapters) retain their original positions.
        argument.replaceWith(types.unaryExpression("void", argument.node));
      },
    },
  };
};
