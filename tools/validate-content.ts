import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import type { AnySchema } from "ajv";
import addFormats from "ajv-formats";
import { parseCatalog } from "../src/data/parse";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");
const schemasRoot = path.join(root, "schemas");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

async function json(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

const catalogSchema = await json(path.join(schemasRoot, "published-catalog.schema.json"));
const tripSchema = await json(path.join(schemasRoot, "published-trip.schema.json"));
const validateCatalog = ajv.compile(catalogSchema as AnySchema);
const validateTrip = ajv.compile(tripSchema as AnySchema);
const catalogPath = path.join(contentRoot, "catalog.json");
const catalogValue = await json(catalogPath);

if (!validateCatalog(catalogValue)) {
  throw new Error(`Neplatný catalog.json:\n${ajv.errorsText(validateCatalog.errors, { separator: "\n" })}`);
}

const catalog = parseCatalog(catalogValue);
const publicIds = new Set<string>();
const slugs = new Set<string>();
for (const item of catalog.trips) {
  if (publicIds.has(item.publicId)) throw new Error(`Duplicitní publicId v katalogu: ${item.publicId}`);
  if (slugs.has(item.slug)) throw new Error(`Duplicitní slug v katalogu: ${item.slug}`);
  publicIds.add(item.publicId);
  slugs.add(item.slug);

  const tripPath = path.join(contentRoot, "trips", item.slug, "trip.json");
  const tripValue = await json(tripPath);
  if (!validateTrip(tripValue)) {
    throw new Error(`Neplatný ${path.relative(root, tripPath)}:\n${ajv.errorsText(validateTrip.errors, { separator: "\n" })}`);
  }
  const trip = tripValue as Record<string, unknown>;
  if (trip.publicId !== item.publicId || trip.slug !== item.slug || trip.revision !== item.revision) {
    throw new Error(`Katalog a trip.json nejsou sladěné pro ${item.slug}.`);
  }
}

const directories = (await readdir(path.join(contentRoot, "trips"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
for (const directory of directories) {
  if (!slugs.has(directory)) throw new Error(`Cesta ${directory} není uvedená v katalogu.`);
}

console.log(`Obsah je platný: ${catalog.trips.length} cest.`);
