// Vercel serverless function that imports the built Express app
const app = require('../backend/dist/src/index.js').default;

module.exports = app; 