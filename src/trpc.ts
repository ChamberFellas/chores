import { initTRPC } from "@trpc/server";
import {
  createExample as createExampleFunc,
  getExamples as getExamplesFunc,
} from "./components/example";
import { CreateExampleInput } from "./types/example.type";

const t = initTRPC.create();

export const appRouter = t.router({
  getExamples: t.procedure.query(getExamplesFunc),
  createExample: t.procedure
    .input(CreateExampleInput)
    .mutation(async (opts) => createExampleFunc(opts.input)),
});

export type AppRouter = typeof appRouter;
