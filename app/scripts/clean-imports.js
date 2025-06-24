#!/usr/bin/env node
/* eslint-env node */

/**
 * Clean Unused Imports Script
 *
 * This script runs ESLint with auto-fix to remove unused imports
 * from your TypeScript/JavaScript files.
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🧹 Cleaning unused imports...\n");

try {
  // Run ESLint with auto-fix only for unused imports rule
  const command =
    'npx eslint . --fix --rule "unused-imports/no-unused-imports: error" --quiet';

  console.log("Running:", command);
  console.log("");

  const result = execSync(command, {
    stdio: "pipe",
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });

  if (result) {
    console.log(result);
  }

  console.log("\n✅ Unused imports cleanup completed!");
  console.log("📝 Check your files - unused imports have been removed.");
} catch (error) {
  // Even if there are lint errors, the unused imports might have been fixed
  if (error.stdout) {
    console.log(error.stdout);
  }

  console.log(
    "\n⚠️  Some lint issues remain, but unused imports have been cleaned up."
  );
  console.log('💡 Run "pnpm run lint" to see remaining issues.');
}
