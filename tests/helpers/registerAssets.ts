import { createRequire } from "node:module";

// Node tests have no Metro asset loader. Keep image imports as opaque sources.
const requireAsset = createRequire(`${process.cwd()}/package.json`);
requireAsset.extensions[".png"] = (module, filename) => {
  module.exports = filename;
};
