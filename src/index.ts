import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./trpc";
import dotenv from "dotenv";
dotenv.config();

import router from "./routes";
import { appRouter } from "./trpc";

export const app = express();
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.json());

app.use(router);

if (process.env.NODE_ENV !== "test") {
  if (!process.env.PORT) {
    console.error("PORT is not defined");
    console.log("Setting port to default: 3000");
  }
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
