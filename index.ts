#!/usr/bin/env bun

import { $ } from "bun";

const isDarkMode = async (): Promise<boolean> => {
  if (process.platform !== "darwin") return true;
  try {
    const result = await $`defaults read -g AppleInterfaceStyle`.quiet();
    return result.text().trim() === "Dark";
  } catch {
    return false;
  }
};

const getPatch = async (): Promise<string> => {
  const args = process.argv.slice(2);
  try {
    if (args.length > 0) {
      const result = await $`git diff ${args}`.quiet();
      return result.text();
    }
    const result = await $`git diff`.quiet();
    return result.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Not a git repository")) {
      console.error("Error: Not a git repository");
      process.exit(1);
    }
    throw err;
  }
};

const patch = await getPatch();
if (!patch.trim()) {
  console.log("No diff to display");
  process.exit(0);
}

const dark = await isDarkMode();
const theme = dark ? "pierre-dark" : "pierre-light";

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Git Diff</title>
  <style>
    :root {
      color-scheme: ${dark ? "dark" : "light"};
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${dark ? "#1a1a1a" : "#ffffff"};
    }
  </style>
</head>
<body>
  <div id="diff"></div>
  <script type="module">
    import { PatchDiff } from "@pierre/diffs/react";
    import React from "react";
    import { createRoot } from "react-dom/client";

    const patch = ${JSON.stringify(patch)};
    
    const App = () => {
      return React.createElement(PatchDiff, {
        patch,
        layout: "stacked",
        theme: "${theme}",
        diffStyle: "bars",
        showLineNumbers: true,
        lineDiffType: "word",
      });
    };

    createRoot(document.getElementById("diff")).render(React.createElement(App));
  </script>
</body>
</html>`;

const server = Bun.serve({
  port: 0,
  routes: {
    "/": new Response(html, {
      headers: { "Content-Type": "text/html" },
    }),
  },
  development: true,
});

const url = `http://localhost:${server.port}`;
console.log(`Opening diff at ${url}`);

await $`open ${url}`;

process.on("SIGINT", () => {
  server.stop();
  process.exit(0);
});

console.log("Press Ctrl+C to exit");
await Bun.sleep(Number.MAX_SAFE_INTEGER);
