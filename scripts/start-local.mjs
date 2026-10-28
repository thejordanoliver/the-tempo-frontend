import { execFileSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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

export function updateEnvContents(contents, url) {
  const newline = contents.includes("\r\n") ? "\r\n" : "\n";
  const assignment = `EXPO_PUBLIC_API_URL=${url}`;
  const pattern = /^[\t ]*(?:export[\t ]+)?EXPO_PUBLIC_API_URL[\t ]*=.*$/gm;
  if (pattern.test(contents)) return contents.replace(pattern, assignment);
  return (
    contents +
    (contents && !contents.endsWith("\n") ? newline : "") +
    assignment +
    newline
  );
}

function main() {
  // Expo must not automatically pick this up in subsequent hosted sessions.
  const envPath = resolve(projectRoot, ".env.tempo-local");
  let lastIp;
  let lastError;
  let child;
  let stopping = false;
  let restarting = false;
  let timer;

  const startExpo = () => {
    const nextChild = spawn(
      process.execPath,
      [
        resolve(projectRoot, "node_modules/expo/bin/cli"),
        "start",
        ...process.argv.slice(2),
      ],
      {
        cwd: projectRoot,
        stdio: "inherit",
        env: {
          ...process.env,
          EXPO_PUBLIC_API_URL: `http://${lastIp}:4000`,
        },
      },
    );
    child = nextChild;
    nextChild.on("error", (error) => {
      clearInterval(timer);
      console.error(error.message);
      process.exitCode = 1;
    });
    nextChild.on("exit", (code, signal) => {
      if (restarting && !stopping) {
        restarting = false;
        startExpo();
        return;
      }
      clearInterval(timer);
      process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
    });
  };

  const update = () => {
    const ip = detectLocalIp();
    if (ip === lastIp) return;
    const url = `http://${ip}:4000`;
    let contents = "";
    try {
      contents = readFileSync(envPath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    writeFileSync(envPath, updateEnvContents(contents, url), { mode: 0o600 });
    console.log(`[local API] Using ${url} (saved to .env.tempo-local)`);
    lastIp = ip;
    lastError = undefined;
    if (child && !restarting) {
      console.log(
        "[local API] Network address changed. Restarting Expo; reconnect the app using the new URL.",
      );
      restarting = true;
      child.kill("SIGTERM");
    }
  };
  update();
  if (process.argv.includes("--update-only")) return;

  // Expo preserves this process-only override while loading the normal .env files.
  startExpo();
  timer = setInterval(() => {
    try {
      update();
    } catch (error) {
      if (error.message !== lastError)
        console.warn(`[local API] ${error.message} Keeping the previous URL.`);
      lastError = error.message;
    }
  }, 5000);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      stopping = true;
      clearInterval(timer);
      child.kill(signal);
    });
  }
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
