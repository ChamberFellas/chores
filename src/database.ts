import mongoose from "mongoose";
import { config } from "dotenv";

config();

const MONGO_URI = process.env.MONGO_URI || "";

export async function connectDB() {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Connected to db!");
    })
    .catch((error) => {
      console.log("error", error);
    });
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
