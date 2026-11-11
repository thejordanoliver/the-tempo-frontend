import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Preview Expo's static export, including extensionless file-based routes.
const root = path.resolve(process.env.TEMPO_WEB_DIR || "dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const candidates = path.extname(file)
      ? [file]
      : [`${file}.html`, path.join(file, "index.html")];
    let resolved;
    for (const candidate of candidates) {
      if (
        await stat(candidate)
          .then((entry) => entry.isFile())
          .catch(() => false)
      ) {
        resolved = candidate;
        break;
      }
    }
    if (!resolved) {
      response.writeHead(404).end("Not found");
      return;
    }
    const body = await readFile(resolved);
    response.writeHead(200, {
      "Content-Type":
        types[path.extname(resolved)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(400).end("Bad request");
  }
}).listen(4173, "127.0.0.1", () => {
  console.log(`Previewing ${root} at http://127.0.0.1:4173`);
});
