import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster";
import { HttpRouter } from "@effect/platform";
import {
  BunClusterSocket,
  BunHttpServer,
  BunRuntime,
} from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { PgClient } from "@effect/sql-pg";
import { WorkflowProxyServer } from "@effect/workflow";
import { Config, Effect, Layer, Logger, LogLevel, Option } from "effect";
import { EmailWorkflow, WorkflowRpcs } from "./workflows";

const EmailWorkflowLayer = EmailWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log("Starting EmailWorkflow with payload:", payload);
    return "this is your email content";
  }),
);

const SqlClientLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
});

const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    BunClusterSocket.layer({
      shardingConfig: {
        runnerAddress: Option.some(RunnerAddress.make("localhost", 34431)),
        runnerListenAddress: Option.some(
          RunnerAddress.make("localhost", 34431),
        ),
      },
      storage: "sql",
    }).pipe(Layer.provide(SqlClientLayer)),
  ),
);

const ClusterLayer = EmailWorkflowLayer.pipe(
  Layer.provideMerge(WorkflowEngineLayer),
);

const RpcLayer = RpcServer.layer(WorkflowRpcs).pipe(
  Layer.provide(WorkflowProxyServer.layerRpcHandlers([EmailWorkflow] as const)),
);

const HttpProtocol = RpcServer.layerProtocolHttp({
  path: "/rpc",
}).pipe(Layer.provide(RpcSerialization.layerNdjson));

const HttpServerLayer = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcLayer),
  Layer.provide(ClusterLayer),
  Layer.provide(HttpProtocol),
  Layer.provide(BunHttpServer.layerServer({ port: 3000 })),
);

Layer.mergeAll(ClusterLayer, HttpServerLayer).pipe(
  Layer.provideMerge(Logger.pretty),
  Layer.launch,
  Logger.withMinimumLogLevel(LogLevel.All),
  BunRuntime.runMain,
);
