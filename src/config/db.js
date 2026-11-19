import mongoose from "mongoose";
import { mangoDbUri } from "./config.js";
import chalk from "chalk";
import crypto from "node:crypto";

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

const connectDB = async () => {
  try {
    await mongoose.connect(mangoDbUri);

    console.log(
      chalk.green.bold("✅ Connected to MongoDB successfully")
    );
  } catch (error) {
    console.error(
      chalk.red("❌ Error connecting to MongoDB:")
    );
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;