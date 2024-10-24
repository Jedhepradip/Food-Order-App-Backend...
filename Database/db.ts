import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MongoDBPath = process.env.MONGODBURL || "";
// Function to connect to the database
export const connectDB = async () => {
  try {
    if (!MongoDBPath) {
      throw new Error("MongoDB connection string is missing!");
    }

    await mongoose.connect(MongoDBPath);
    console.log("Database connection successfully established...");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
