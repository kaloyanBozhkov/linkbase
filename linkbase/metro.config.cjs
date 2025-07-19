// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const linkbaseRoot = path.resolve(projectRoot, "linkbase");
const packagesRoot = path.resolve(workspaceRoot, "packages");
const sharedRoot = path.resolve(packagesRoot, "shared");
const prismaRoot = path.resolve(packagesRoot, "prisma");

const config = getDefaultConfig(__dirname);
config.watchFolders = [packagesRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(linkbaseRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
  path.resolve(sharedRoot, "node_modules"),
  path.resolve(prismaRoot, "node_modules"),
];

module.exports = config;
