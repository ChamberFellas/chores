import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import {
  createExample as createExampleFunc,
  getExamples as getExamplesFunc,
} from "./components/example";
import { CreateExampleInput } from "./types/example.type";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getExamples: t.procedure.query(getExamplesFunc),
  createExample: t.procedure
    .input(CreateExampleInput)
    .mutation(async (opts) => createExampleFunc(opts.input)),
});

export type AppRouter = typeof appRouter;
