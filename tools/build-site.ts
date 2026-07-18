import { cp, copyFile, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCatalog } from "../src/data/parse";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const content = path.join(root, "content");
const dataTarget = path.join(dist, "data");

await rm(dataTarget, { recursive: true, force: true });
await mkdir(dataTarget, { recursive: true });
await copyFile(path.join(content, "catalog.json"), path.join(dataTarget, "catalog.json"));
await cp(path.join(content, "trips"), path.join(dataTarget, "trips"), { recursive: true });

const catalog = parseCatalog(JSON.parse(await readFile(path.join(content, "catalog.json"), "utf8")));
const rootHtml = path.join(dist, "index.html");
for (const trip of catalog.trips) {
  const routeDirectory = path.join(dist, "trips", trip.slug);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(rootHtml, path.join(routeDirectory, "index.html"));
}

console.log(`Vygenerováno ${catalog.trips.length} fyzických route cest.`);

