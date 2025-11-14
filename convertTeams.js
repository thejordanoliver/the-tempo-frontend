const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "teamsCFB.ts");
const outputFile = path.join(__dirname, "teamsCFB.json");

try {
  let content = fs.readFileSync(inputFile, "utf-8");

  // 1️⃣ Remove export, const, type annotations
  content = content.replace(/export\s+const\s+\w+\s*(:[\w\[\]]+)?\s*=\s*/, "");

  // 2️⃣ Remove imports
  content = content.replace(/^import.*$/gm, "");

  // 3️⃣ Replace Logo, Stadium, or any other identifiers with null
  content = content.replace(/\b[A-Za-z0-9_]+(Logo(Light)?|Stadium)\b/g, "null");

  // 4️⃣ Remove single-line and block comments
  content = content.replace(/\/\/.*$/gm, "");
  content = content.replace(/\/\*[\s\S]*?\*\//g, "");

  // 5️⃣ Remove trailing commas before } or ]
  content = content.replace(/,(\s*[}\]])/g, "$1");

  // 6️⃣ Wrap in brackets if not already (ensures JSON array)
  content = content.trim();
  if (!content.startsWith("[")) {
    content = `[${content}]`;
  }

  // 7️⃣ Convert to JSON
  const json = JSON.parse(content);

  // 8️⃣ Write to output file
  fs.writeFileSync(outputFile, JSON.stringify(json, null, 2), "utf-8");
  console.log(`✅ Successfully created ${outputFile}`);
} catch (err) {
  console.error("❌ Failed to convert teamsCFB.ts:", err.message);
}
