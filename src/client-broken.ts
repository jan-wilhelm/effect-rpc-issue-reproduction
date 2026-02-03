import { BunContext, BunRuntime } from "@effect/platform-bun";
import { RpcClient } from "@effect/rpc";
import { Effect, Layer } from "effect";
import { EmailWorkflowClient, ProtocolLive } from "./shared";
import { WorkflowRpcs } from "./workflows";

const program = Effect.gen(function* () {
  const emailClient = yield* RpcClient.make(WorkflowRpcs);

  yield* Effect.log("Starting Workflow RPC call");
  yield* emailClient.EmailWorkflow({ id: "1", to: "a@b.c" });
  yield* Effect.log("Workflow finished");
});

const MainLive = EmailWorkflowClient.layer.pipe(
  Layer.provideMerge(ProtocolLive),
  Layer.provideMerge(BunContext.layer),
);

program.pipe(Effect.provide(MainLive), Effect.scoped, BunRuntime.runMain({}));
