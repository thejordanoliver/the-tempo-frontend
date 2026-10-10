import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function detectLocalIp() {
  const interfaces = networkInterfaces();
  // On macOS, use the active route rather than guessing that Wi-Fi is en0.
  let preferredInterface = process.env.TEMPO_LOCAL_INTERFACE;
  if (!preferredInterface && process.platform === 'darwin') {
    try {
      const route = execFileSync('/sbin/route', ['-n', 'get', 'default'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000,
      });
      preferredInterface = route.match(/interface:\s*(\S+)/)?.[1];
    } catch { /* Fall back to an unambiguous physical network address. */ }
  }
  const candidates = Object.entries(interfaces).flatMap(([name, addresses]) => {
    if (preferredInterface ? name !== preferredInterface : /^(lo|utun|tun|tap|docker|veth|bridge|vmnet)/i.test(name)) return [];
    return (addresses ?? []).filter((address) =>
      address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.'),
    ).map((address) => address.address);
  });
  const unique = [...new Set(candidates)];
  if (unique.length !== 1) {
    throw new Error('Cannot identify one active LAN IPv4 address. Connect to Wi-Fi or set TEMPO_LOCAL_INTERFACE to your LAN interface (for example en0).');
  }
  return unique[0];
}

export function updateEnvContents(contents, url) {
  const newline = contents.includes('\r\n') ? '\r\n' : '\n';
  const assignment = `EXPO_PUBLIC_API_URL=${url}`;
  const pattern = /^[\t ]*(?:export[\t ]+)?EXPO_PUBLIC_API_URL[\t ]*=.*$/gm;
  if (pattern.test(contents)) return contents.replace(pattern, assignment);
  return contents + (contents && !contents.endsWith('\n') ? newline : '') + assignment + newline;
}

function main() {
  const envPath = resolve(projectRoot, '.env.local');
  let lastIp;
  let lastError;
  const update = () => {
    const ip = detectLocalIp();
    if (ip === lastIp) return;
    const url = `http://${ip}:4000`;
    let contents = '';
    try { contents = readFileSync(envPath, 'utf8'); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    writeFileSync(envPath, updateEnvContents(contents, url), { mode: 0o600 });
    console.log(`[local API] .env.local updated: ${url}`);
    if (lastIp) console.log('[local API] Network address changed. Reload the app to use the new URL; reconnect to Expo if needed.');
    lastIp = ip;
    lastError = undefined;
  };
  update();
  if (process.argv.includes('--update-only')) return;

  // Let Expo load the generated file, even if the parent shell had a stale URL.
  const env = { ...process.env };
  delete env.EXPO_PUBLIC_API_URL;
  const child = spawn(process.execPath, [resolve(projectRoot, 'node_modules/expo/bin/cli'), 'start', ...process.argv.slice(2)], {
    cwd: projectRoot, stdio: 'inherit', env,
  });
  const timer = setInterval(() => {
    try { update(); } catch (error) {
      if (error.message !== lastError) console.warn(`[local API] ${error.message} Keeping the previous URL.`);
      lastError = error.message;
    }
  }, 5000);
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => { clearInterval(timer); child.kill(signal); });
  }
  child.on('error', (error) => {
    clearInterval(timer);
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    clearInterval(timer);
    process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    console.error(`[local API] ${error.message}`);
    process.exitCode = 1;
  }
}
