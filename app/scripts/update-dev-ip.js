#!/usr/bin/env node
/* eslint-env node */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getLocalIP() {
  try {
    // For macOS
    if (process.platform === "darwin") {
      const ip = execSync("ipconfig getifaddr en0", {
        encoding: "utf8",
      }).trim();
      return ip;
    }
    // For Windows
    else if (process.platform === "win32") {
      const output = execSync("ipconfig", { encoding: "utf8" });
      const match = output.match(/IPv4 Address[.\s]*:\s*([0-9.]+)/);
      return match ? match[1] : null;
    }
    // For Linux
    else {
      const output = execSync("hostname -I", { encoding: "utf8" });
      return output.split(" ")[0].trim();
    }
  } catch (error) {
    console.error("Could not detect IP address:", error.message);
    return null;
  }
}

function updateConfigFile(ip) {
  // eslint-disable-next-line no-undef
  const configPath = path.join(__dirname, "../src/config/api.config.ts");

  if (!fs.existsSync(configPath)) {
    console.error("Config file not found:", configPath);
    return false;
  }

  let content = fs.readFileSync(configPath, "utf8");

  // Replace the IP address in the config
  const updatedContent = content.replace(
    /const DEV_HOST_IP = '[^']*';/,
    `const DEV_HOST_IP = '${ip}';`
  );

  fs.writeFileSync(configPath, updatedContent, "utf8");
  console.log(`✅ Updated API config with IP: ${ip}`);
  return true;
}

function main() {
  console.log("🔍 Detecting local IP address...");

  const ip = getLocalIP();

  if (!ip) {
    console.error("❌ Could not detect local IP address");
    console.log(
      "Please manually update the DEV_HOST_IP in src/config/api.config.ts"
    );
    process.exit(1);
  }

  console.log(`📡 Found IP: ${ip}`);

  if (updateConfigFile(ip)) {
    console.log("🚀 Ready to run your app!");
  } else {
    console.error("❌ Failed to update config file");
    process.exit(1);
  }
}

main();
