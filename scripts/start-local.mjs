import { execFileSync, spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function detectLocalIp() {
  const interfaces = networkInterfaces();
  // On macOS, use the active route rather than guessing that Wi-Fi is en0.
  let preferredInterface = process.env.TEMPO_LOCAL_INTERFACE;
  if (!preferredInterface && process.platform === "darwin") {
    try {
      const route = execFileSync("/sbin/route", ["-n", "get", "default"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 2000,
      });
      preferredInterface = route.match(/interface:\s*(\S+)/)?.[1];
    } catch {
      /* Fall back to an unambiguous physical network address. */
    }
  }
  const candidates = Object.entries(interfaces).flatMap(([name, addresses]) => {
    if (
      preferredInterface
        ? name !== preferredInterface
        : /^(lo|utun|tun|tap|docker|veth|bridge|vmnet)/i.test(name)
    )
      return [];
    return (addresses ?? [])
      .filter(
        (address) =>
          address.family === "IPv4" &&
          !address.internal &&
          !address.address.startsWith("169.254."),
      )
      .map((address) => address.address);
  });
  const unique = [...new Set(candidates)];
  if (unique.length !== 1) {
    throw new Error(
      "Cannot identify one active LAN IPv4 address. Connect to Wi-Fi or set TEMPO_LOCAL_INTERFACE to your LAN interface (for example en0).",
    );
  }
  return unique[0];
}

function main() {
  const url = `http://${detectLocalIp()}:4000`;
  console.log(`[local API] Using session API URL: ${url}`);
  // Keep the old diagnostic option without writing an environment file.
  if (process.argv.includes("--update-only")) return;

  // Expo preserves process variables while loading the remaining settings from .env.
  const env = { ...process.env, EXPO_PUBLIC_API_URL: url };
  const child = spawn(
    process.execPath,
    [
      resolve(projectRoot, "node_modules/expo/bin/cli"),
      "start",
      ...process.argv.slice(2),
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env,
    },
  );
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(`[local API] ${error.message}`);
    process.exitCode = 1;
  }
}
