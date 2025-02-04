import express from "express";
import dotenv from "dotenv";
dotenv.config();

import router from "./routes";

export const app = express();
app.use(express.json());

app.use(router);

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    process.exit(1);
  }
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
