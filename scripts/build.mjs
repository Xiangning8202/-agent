import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, "index.html"), resolve(dist, "index.html"));
await cp(resolve(root, "src"), resolve(dist, "src"), { recursive: true });

async function collectFiles(directory, prefix = "") {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, await collectFiles(absolutePath, relativePath));
    else files[`/${relativePath}`] = await readFile(absolutePath, "utf8");
  }
  return files;
}

const assets = await collectFiles(dist);
const workerSource = `const assets = ${JSON.stringify(assets)};
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const body = assets[requestedPath] ?? assets["/index.html"];
    const extension = requestedPath.match(/\\.[^.]+$/)?.[0] ?? ".html";
    return new Response(body, {
      headers: {
        "content-type": contentTypes[extension] ?? "text/plain; charset=utf-8",
        "cache-control": extension === ".html" ? "no-cache" : "public, max-age=3600"
      }
    });
  }
};
`;

await mkdir(resolve(dist, "server"), { recursive: true });
await writeFile(resolve(dist, "server", "index.js"), workerSource, "utf8");
const output = await stat(resolve(dist, "index.html"));
if (!output.isFile()) throw new Error("Build did not produce index.html");
const worker = await stat(resolve(dist, "server", "index.js"));
if (!worker.isFile()) throw new Error("Build did not produce server/index.js");
console.log("Deployable static build ready:", dist);
