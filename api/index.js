const app = require("../src/app.ts").default;
const serverless = require("serverless-http");

module.exports = serverless(app);
