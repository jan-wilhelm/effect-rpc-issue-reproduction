# effect-rpc-issue-reproduction

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/client-broken.ts

bun run src/client-working.ts
```

The only difference between client-broken and client-working is this:

```diff
 import { BunContext, BunRuntime } from "@effect/platform-bun";
-import { RpcClient } from "@effect/rpc";
 import { Effect, Layer } from "effect";
 import { EmailWorkflowClient, ProtocolLive } from "./shared";
-import { WorkflowRpcs } from "./workflows";
 
 const program = Effect.gen(function* () {
-  const emailClient = yield* RpcClient.make(WorkflowRpcs);
+  const emailClient = yield* EmailWorkflowClient;
 
   yield* Effect.log("Starting Workflow RPC call");
   yield* emailClient.EmailWorkflow({ id: "1", to: "a@b.c" });
```
