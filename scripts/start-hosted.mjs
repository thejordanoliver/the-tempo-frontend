import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function getHostedApiUrl(contents) {
  const url = parseEnv(contents).EXPO_PUBLIC_API_URL?.trim();
  if (!url) throw new Error('Set EXPO_PUBLIC_API_URL to your hosted backend URL in .env.');
  let parsed;
  try { parsed = new URL(url); } catch {
    throw new Error('EXPO_PUBLIC_API_URL in .env must be an absolute http(s) URL.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('EXPO_PUBLIC_API_URL in .env must use http:// or https://.');
  }
  return url.replace(/\/+$/, '');
}

function main() {
  let contents;
  try { contents = readFileSync(resolve(projectRoot, '.env'), 'utf8'); } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Create .env with EXPO_PUBLIC_API_URL set to your hosted backend URL.');
    throw error;
  }
  const url = getHostedApiUrl(contents);
  // Expo preserves existing process variables when loading dotenv files.
  // Override only the API URL so other .env.local settings still work.
  const env = { ...process.env, EXPO_PUBLIC_API_URL: url };
  console.log(`[hosted API] Using EXPO_PUBLIC_API_URL from .env: ${url}`);
  const child = spawn(process.execPath, [resolve(projectRoot, 'node_modules/expo/bin/cli'), 'start', ...process.argv.slice(2)], {
    cwd: projectRoot, stdio: 'inherit', env,
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
  }
  child.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    console.error(`[hosted API] ${error.message}`);
    process.exitCode = 1;
  }
}
