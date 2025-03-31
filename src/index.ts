import express from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import { connectDB } from "./database";
import choreRouter from "./chores";

export const app = express();

app.use(express.json());

app.use(router);
app.use(choreRouter);

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
  });
}
