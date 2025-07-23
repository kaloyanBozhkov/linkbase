module.exports = {
  apps: [
    {
      name: "react-native-apps-backend",
      script: "dist/src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "__DATABASE_URL__",
      },
    },
  ],
};
