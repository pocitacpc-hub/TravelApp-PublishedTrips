import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "public", "data");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(path.join(root, "content", "catalog.json"), path.join(target, "catalog.json"));
await cp(path.join(root, "content", "trips"), path.join(target, "trips"), { recursive: true });

console.log("Veřejná data jsou připravena pro dev server a build.");
