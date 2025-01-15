import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";
import logger from "../utils/logger.js";
const connectDB = async () => {
  try {
    const connectionObj = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    logger.info(`successfully connected to database`);
  } catch (error) {
    console.log("Database connection failed.");
    process.exit(1);
  }
};

export default connectDB;
