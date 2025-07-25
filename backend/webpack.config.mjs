import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import NodemonWebpackPlugin from "nodemon-webpack-plugin";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";

const { BannerPlugin } = webpack;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (_env, argv) => {
  const isDevelopment = argv.mode !== "production";
  const isWatch = !!argv.watch;
  const mode = isDevelopment ? "development" : "production";

  return {
    mode,
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    target: "node",
    externalsPresets: { node: true },
    externals: [
      nodeExternals({
        additionalModuleDirs: [
          path.resolve(__dirname, "..", "node_modules"),
          path.resolve(__dirname, "..", "packages", "shared", "node_modules"),
          path.resolve(__dirname, "..", "packages", "prisma", "node_modules"),
        ],
        importType: "commonjs",
        // Bundle everything except @prisma/client binaries
        allowlist: [
          // Bundle all packages including @linkbase/* (webpack will compile TS)
          /.*/,
        ],
      }),
    ],
    entry: path.join(__dirname, "src", "index.ts"),
    output: {
      filename: "index.js",
      path: path.join(__dirname, "dist", "src"),
      clean: true,
      devtoolModuleFilenameTemplate: isDevelopment ? "[absolute-resource-path]" : "[resource-path]",
      devtoolFallbackModuleFilenameTemplate: "[absolute-resource-path]",
    },
    optimization: { minimize: false },
    performance: { hints: false },
    plugins: [
      // webpack sets NODE_ENV based on mode using DefinePlugin but it doesn't work on external dependencies
      new BannerPlugin({
        banner: `process.env.NODE_ENV = ${JSON.stringify(mode)};
process.env.RELEASE_HASH = ${JSON.stringify(process.env.RELEASE_HASH)};`,
        raw: true,
      }),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "*.html",
            to: path.join(__dirname, "dist", "src", "pages"),
            context: path.join(__dirname, "src", "pages"),
          },
          // Copy Prisma client files to the dist @prisma/client location
          {
            from: path.join(__dirname, "..", "packages", "prisma", "client"),
            to: path.join(__dirname, "dist", "node_modules", "@prisma", "client"),
            globOptions: {
              ignore: ["**/node_modules/**"],
            },
          },
          // Copy to deployment root node_modules location (one level up from backend)
          {
            from: path.join(__dirname, "..", "packages", "prisma", "client"),
            to: path.join(__dirname, "..", "node_modules", "@prisma", "client"),
            globOptions: {
              ignore: ["**/node_modules/**"],
            },
          },
        ],
      }),
      ...(isWatch
        ? [
            // Watch mode only plugins
            new NodemonWebpackPlugin({
              verbose: false,
              ext: "js,ts,json",
              nodeArgs: ["--enable-source-maps"],
              ignore: ["*.js.map"],
              delay: 100, // Avoid restarting multiple times if many files were generated
              watch: [
                path.resolve(__dirname, "dist"),
                path.resolve(__dirname, "..", "packages", "shared"),
                path.resolve(__dirname, "..", "packages", "prisma"),
              ],
            }),
          ]
        : []),
    ],
    stats: {
      all: isWatch ? false : undefined, // Disable logs on watch mode
      errors: true,
      errorDetails: true,
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          exclude: [
            /node_modules/,
          ],
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  decorators: true,
                },
                target: "es2022",
                transform: {
                  decoratorMetadata: true,
                },
              },
              module: {
                type: "commonjs",
              },
              sourceMaps: isDevelopment,
              inputSourceMap: false, // Don't try to read input source maps
            },
          },
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@linkbase/shared": path.resolve(__dirname, "..", "packages", "shared", "src"),
        "@linkbase/prisma": path.resolve(__dirname, "..", "packages", "prisma", "src"),
      },
    },
    node: {
      __dirname: true,
      __filename: true,
    },
  };
}; 