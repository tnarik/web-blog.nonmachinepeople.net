"use strict";

const path = require("node:path");
const realFs = require("node:fs");
const { Volume, createFsFromVolume } = require("memfs");
const { ufs } = require("unionfs");

// same as in test.js
const opener = "{{";
const closer = "}}";
const placeholder = "`ignored`";

// same as function placeholderForLine from test.js
function placeholderForLine(line) {
  if (line.trim() === "") return line;
  const indent = (line.match(/^\s*/) || [""])[0];
  return `${indent}${placeholder}`;
}

// same as sanitizeGoTemplateBlocks from test.js
function cleanGoTemplate(input) {
  const lines = input.split("\n");
  let inTemplateBlock = false;

  return lines
    .map((line) => {
      const trimmed = line.trim();

      if (inTemplateBlock) {
        const replaced = placeholderForLine(line);
        if (trimmed.includes(closer)) inTemplateBlock = false;
        return replaced;
      }

      if (
        trimmed.startsWith(opener) &&
        trimmed.includes(closer) &&
        trimmed.endsWith(closer)
      ) {

        return placeholderForLine(line);
      }

      if (trimmed.startsWith(opener) && !trimmed.includes(closer)) {
        inTemplateBlock = true;
        return placeholderForLine(line);
      }

      return line;
    })
    .join("\n");
}

async function run() {
  // markdownlint-cli2 is ESM-only; we must use dynamic import()
  // to load it into a CommonJS (.cjs) file.
  const { main } = await import("markdownlint-cli2");
  const { default: globby } = await import("globby");

  const argv = process.argv.slice(2);
  const files = await globby(argv, { absolute: true });

  const volume = new Volume();
  const memFs = createFsFromVolume(volume);

  for (const filePath of files) {
    const raw = realFs.readFileSync(filePath, "utf8");
    const transformed = cleanGoTemplate(raw);

    memFs.mkdirSync(path.dirname(filePath), { recursive: true });
    memFs.writeFileSync(filePath, transformed, "utf8");
  }

  const layeredFs = ufs.use(realFs).use(memFs);

  // debug: read the first file from the layered FS to verify it contains the transformed content
  layeredFs.readFile(files[0], "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file from layered FS: ${err}`);
    } else {
      console.log(`Content read from layered FS (for ${files[0]}):\n${data}`);
      console.log(`-------`)
    }
  });

  const exitCode = await main({
    argv: argv,
    fs: layeredFs,
    logError: console.error
  });
  process.exitCode = exitCode;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
