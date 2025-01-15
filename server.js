import dotenv from "dotenv";
import server from "./app.js"
import logger from "./utils/logger.js";
dotenv.config();
const PORT = process.env.PORT || 5001;


server.listen(PORT, () => {
  logger.info(`serving on http://localhost:${PORT}`);
});
