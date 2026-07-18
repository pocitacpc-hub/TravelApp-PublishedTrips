import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");
const forbiddenKeys = new Set([
  "bookingcode", "reservationcode", "pnr", "ticketnumber", "passportnumber",
  "boardingpass", "qrpayload", "password", "plaintextpassword", "githubtoken",
  "sourcesnapshotjson", "internalid", "filepath", "localpath"
]);
const tokenPattern = /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g;

async function files(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(fullPath));
    else result.push(fullPath);
  }
  return result;
}

function inspectKeys(value: unknown, source: string, currentPath = "$"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectKeys(item, source, `${currentPath}[${index}]`));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, item] of Object.entries(value)) {
    if (forbiddenKeys.has(key.toLowerCase())) {
      throw new Error(`Zakázané veřejné pole ${currentPath}.${key} v ${source}.`);
    }
    inspectKeys(item, source, `${currentPath}.${key}`);
  }
}

for (const file of await files(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const baseName = path.basename(file).toLowerCase();
  if (baseName === ".env" || baseName.startsWith(".env.")) {
    throw new Error(`Zakázaný konfigurační soubor: ${relative}`);
  }
  if (relative.startsWith("content/") && /\/attachments\/.*\.(pdf|png|jpe?g)$/i.test(relative)) {
    throw new Error(`Citlivá příloha musí být před commitem zašifrovaná: ${relative}`);
  }
  if (!/\.(json|md|ts|html|css|ya?ml|txt)$/i.test(file)) continue;
  const fileText = await readFile(file, "utf8");
  if (tokenPattern.test(fileText)) throw new Error(`Soubor připomíná GitHub token: ${relative}`);
  tokenPattern.lastIndex = 0;
  if (file.startsWith(contentRoot) && file.endsWith(".json")) inspectKeys(JSON.parse(fileText), relative);
}

console.log("Security lint nenašel zakázaná pole, tokeny ani otevřené citlivé přílohy.");

