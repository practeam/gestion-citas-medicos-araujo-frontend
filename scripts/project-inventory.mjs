
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const EXCLUDED_DIRS = new Set([
  ".git",
  ".venv",
  "venv",
  "node_modules",
  "__pycache__",
  ".idea",
  ".vscode",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".cache"
]);

const SOURCE_EXTENSIONS = new Set([
  ".tsx",
  ".jsx",
  ".ts",
  ".js"
]);

function walkDirectory(directory, depth = 0, tree = []) {
  let entries;

  try {
    entries = fs.readdirSync(directory, {
      withFileTypes: true
    });
  } catch {
    return tree;
  }

  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) {
      return a.isDirectory() ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    tree.push({
      path: fullPath,
      name: entry.name,
      depth,
      isDirectory: entry.isDirectory()
    });

    if (entry.isDirectory()) {
      walkDirectory(fullPath, depth + 1, tree);
    }
  }

  return tree;
}

function detectExports(content) {
  const declarations = new Set();

  const patterns = [
    /export\s+(?:default\s+)?function\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=/g,
    /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s*\{([^}]+)\}/g
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const names = match[1]
        .split(",")
        .map(value => value.trim().split(/\s+as\s+/).pop())
        .filter(name => /^[A-Z][A-Za-z0-9_]*$/.test(name));

      names.forEach(name => declarations.add(name));
    }
  }

  return [...declarations];
}

function inspectFiles(tree) {
  const files = [];

  for (const item of tree) {
    if (item.isDirectory) continue;

    if (!SOURCE_EXTENSIONS.has(path.extname(item.name))) {
      continue;
    }

    try {
      const content = fs.readFileSync(item.path, "utf8");
      const exports = detectExports(content);

      if (exports.length > 0) {
        files.push({
          name: item.name,
          path: path.relative(ROOT, item.path),
          exports
        });
      }
    } catch {
      // Ignorar archivos que no puedan leerse.
    }
  }

  return files;
}

function printTree(tree) {
  console.log("\nESTRUCTURA DEL PROYECTO\n");
  console.log(`${path.basename(ROOT)}/`);

  for (const item of tree) {
    const indentation = "    ".repeat(item.depth);
    const marker = item.isDirectory ? "/" : "";

    console.log(`${indentation}├── ${item.name}${marker}`);
  }
}

function printComponents(files) {
  console.log("\nCOMPONENTES Y EXPORTACIONES DETECTADAS\n");

  for (const file of files) {
    console.log(`- ${file.name}: ${file.exports.join(", ")}`);
  }
}

function main() {
  console.log("==================================");
  console.log(" INVENTARIO DEL PROYECTO FRONTEND ");
  console.log("==================================");

  console.log(`\nRuta: ${ROOT}`);

  const tree = walkDirectory(ROOT);
  const files = inspectFiles(tree);

  printTree(tree);
  printComponents(files);

  console.log("\nRESUMEN");
  console.log(`Archivos fuente analizados: ${tree.filter(
    item => !item.isDirectory &&
      SOURCE_EXTENSIONS.has(path.extname(item.name))
  ).length}`);

  console.log(`Archivos con exportaciones detectadas: ${files.length}`);

  console.log("\nINVENTARIO FINALIZADO\n");
}

main();
