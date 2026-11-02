import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getHostedApiUrl } from "./start-hosted.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

try {
  const apiUrl = getHostedApiUrl(
    readFileSync(resolve(projectRoot, ".env"), "utf8"),
  );
  const args = process.argv.slice(2);
  const hasDevice = args.some(
    (arg) => arg === "--device" || arg === "-d" || arg.startsWith("--device="),
  );
  console.log(`[iOS device] Building a standalone app using ${apiUrl}`);
  const child = spawn(
    process.execPath,
    [
      resolve(projectRoot, "node_modules/expo/bin/cli"),
      "run:ios",
      "--configuration",
      "Release",
      "--no-bundler",
      ...(!hasDevice ? ["--device"] : []),
      ...args,
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
    },
  );
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
  });
} catch (error) {
  console.error(`[iOS device] ${error.message}`);
  process.exitCode = 1;
}
