import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionObj = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("MongoDB connected!");
  } catch (error) {
    console.log("Database connection failed.");
    // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    process.exit(1);
  }
};

export default connectDB;
