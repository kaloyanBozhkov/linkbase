#!/usr/bin/env node

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
  // Run ESLint with auto-fix for unused imports
  const command =
    'npx eslint . --fix --rule "unused-imports/no-unused-imports: error" --rule "unused-imports/no-unused-vars: error"';

  console.log("Running:", command);
  console.log("");

  execSync(command, {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("\n✅ Unused imports cleanup completed!");
  console.log("📝 Check your files - unused imports have been removed.");
} catch (error) {
  console.error("\n❌ Error running cleanup:");
  console.error(error.message);
  process.exit(1);
}
