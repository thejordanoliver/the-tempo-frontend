const LIST_SOURCE =
  "/node_modules/react-native-draggable-flatlist/src/components/DraggableFlatList.tsx";

module.exports = function draggableFlatListReset({ types }) {
  return {
    name: "tempo-draggable-flat-list-reset",
    visitor: {
      ImportDeclaration(path, { file }) {
        const filename = file.opts.filename?.replace(/\\/g, "/");
        if (
          !["ios", "android"].includes(file.opts.caller?.platform) ||
          !filename?.endsWith(LIST_SOURCE) ||
          path.node.source.value !== "react-native"
        ) {
          return;
        }

        const specifier = path
          .get("specifiers")
          .find(
            (specifier) =>
              specifier.isImportSpecifier() &&
              specifier
                .get("imported")
                .isIdentifier({ name: "InteractionManager" }),
          );
        if (!specifier) return;

        const references = path.scope.getBinding(
          specifier.node.local.name,
        ).referencePaths;
        const methods = references.map((reference) => reference.parentPath);
        if (
          !methods.every(
            (method) =>
              method.isMemberExpression({ computed: false }) &&
              method
                .get("property")
                .isIdentifier({ name: "runAfterInteractions" }) &&
              method.key === "callee" &&
              method.parentPath.isCallExpression(),
          )
        ) {
          return;
        }

        // Keep drag resets deferred past the current render. Remove this patch
        // once the library ships https://github.com/computerjazz/react-native-draggable-flatlist/pull/628.
        for (const method of methods) {
          method.replaceWith(types.identifier("requestAnimationFrame"));
        }
        specifier.remove();
      },
    },
  };
};
