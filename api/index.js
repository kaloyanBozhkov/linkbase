// Vercel serverless function entry point
const app = require('../backend/dist/src/index.js').default;

module.exports = app; 