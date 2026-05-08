// wrap.cjs
"use strict";

const realFs = require("node:fs");
const { Volume, createFsFromVolume } = require("memfs");
const { ufs } = require("unionfs");

async function run() {
  // markdownlint-cli2 is ESM-only; we must use dynamic import()
  // to load it into a CommonJS (.cjs) file.
  const { main } = await import("markdownlint-cli2");
  const { default: globby } = await import("globby");

  const argv = process.argv.slice(2);

  // if (!fs.existsSync(fileName)) {
  //   console.error(`File not found: ${fileName}`);
  //   return;
  // }

  // const rawContent = fs.readFileSync(fileName, "utf8");

  // // Scrub the internal content but keep newlines
  const cleanContent = (fileName) => {
    const rawContent = realFs.readFileSync(fileName, "utf8");
    return rawContent.replace(/{{([\s\S]*?)}}/g, (match) => {
      return "`" + match.slice(2, -2).replace(/[^\n]/g, "x") +"`";
    });

    return 'asdf';
  };
  // rawContent.replace(/{{([\s\S]*?)}}/g, (match) => {
  //   return "`" + match.slice(2, -2).replace(/[^\n]/g, " ") + "`";
  // });

  // Pass the modified content to the linter
  // console.log(cleanContent)
  const files = await globby(argv);

  const exitCode = await main({
    "argv": argv,
    // "directory": ".",
    // "fileContents": {
    //   "content/adventures/the-road-to-the-valley.en.md": 'asdfasdfasdf',
    //   [fileName]: cleanContent
    // },
    "fileContents": new Proxy({}, {
      get: (target, prop) => {
        // console.log(`Accessing content for: ${prop}`);

         if (typeof prop !== "string") {
          return Reflect.get(target, prop);
        }
        return cleanContent(prop);
      },
      has: (target, prop) =>{
        console.log('has');
        if (typeof prop === "string") {
          return true;
        }
        return Reflect.has(target, prop);
      },
          ownKeys: (target) => files,
    getOwnPropertyDescriptor: (target, prop) =>{
              // console.log('getOwnPropertyDescriptor');

      if  (typeof prop === "string" && prop in files) {
        return {
          value: cleanContent(prop),
          writable: false,
          enumerable: true,
          configurable: true
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    }),

    "logError": console.error
  });

  if (exitCode !== 0) {
    console.log(`\nLinter finished with exit code: ${exitCode}`);
  } else {
    console.log("\nLinter found no issues (or failed to run rules).");
  }
}

run().catch(console.error);
