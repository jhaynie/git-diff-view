#!/usr/bin/env bun

import { $ } from "bun";
import index from "./index.html";

const SCRIPT_PATH = import.meta.path;

const isDarkMode = async (): Promise<boolean> => {
  if (process.platform !== "darwin") return true;
  try {
    const result = await $`defaults read -g AppleInterfaceStyle`.quiet();
    return result.text().trim() === "Dark";
  } catch {
    return false;
  }
};

const getPatch = async (args: string[]): Promise<string> => {
  try {
    const proc = Bun.spawn(["git", "diff", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      if (stderr.includes("Not a git repository")) {
        console.error("Error: Not a git repository");
        process.exit(1);
      }
      console.error(stderr);
      process.exit(exitCode);
    }
    return stdout;
  } catch (err) {
    throw err;
  }
};

const install = async () => {
  const aliasValue = `!${SCRIPT_PATH} run`;
  await $`git config --global alias.dv ${aliasValue}`;
  console.log("✓ Installed git alias 'dv'");
  console.log("  Usage: git dv [options]");
};

const uninstall = async () => {
  try {
    await $`git config --global --unset alias.dv`.quiet();
    console.log("✓ Uninstalled git alias 'dv'");
  } catch {
    console.log("Alias 'dv' was not installed");
  }
};

const run = async (args: string[]) => {
  const patch = await getPatch(args);
  if (!patch.trim()) {
    console.log("No diff to display");
    process.exit(0);
  }

  const dark = await isDarkMode();
  const theme = dark ? "pierre-dark" : "pierre-light";

  const diffData = JSON.stringify({ patch, theme });

  const server = Bun.serve({
    port: 0,
    development: false,
    routes: {
      "/": index,
      "/api/diff": new Response(diffData, {
        headers: { "Content-Type": "application/json" },
      }),
    },
  });

  const url = `http://localhost:${server.port}`;
  await $`open ${url}`.quiet();

  await Bun.sleep(3000);
  server.stop();
  process.exit(0);
};

const showHelp = () => {
  console.log(`git-diff-view - Beautiful git diffs in your browser

Usage:
  git-diff-view <command> [options]

Commands:
  install     Install the 'git dv' alias globally
  uninstall   Remove the 'git dv' alias
  run         View diff in browser (used by the alias)

Examples:
  git-diff-view install
  git-diff-view run
  git-diff-view run --staged
  git-diff-view run HEAD~3

After installing, use:
  git dv              # unstaged changes
  git dv --staged     # staged changes
  git dv HEAD~3       # last 3 commits
`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "install":
      await install();
      break;
    case "uninstall":
      await uninstall();
      break;
    case "run":
      await run(args.slice(1));
      break;
    case "--help":
    case "-h":
      showHelp();
      break;
    default:
      if (!command) {
        showHelp();
      } else {
        console.error(`Unknown command: ${command}`);
        console.error("Run 'git-diff-view --help' for usage");
        process.exit(1);
      }
  }
};

main();
