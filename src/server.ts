import app from "./app";
import SERVER_CONFIG from "./config/server.config";
app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`
🚀 Server started in ${SERVER_CONFIG.NODE_ENV} mode on port ${SERVER_CONFIG.PORT}
🔗 API is available at http://${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}${SERVER_CONFIG.API_PREFIX}
  `);
});
