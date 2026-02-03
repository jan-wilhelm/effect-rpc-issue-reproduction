import { FetchHttpClient } from "@effect/platform";
import {
  RpcClient,
  RpcClientError,
  RpcGroup,
  RpcSerialization,
} from "@effect/rpc";
import { Context, Layer } from "effect";
import { WorkflowRpcs } from "./workflows";

export const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:3000/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class EmailWorkflowClient extends Context.Tag(
  "domain/EmailWorkflowClient",
)<
  EmailWorkflowClient,
  RpcClient.RpcClient<
    RpcGroup.Rpcs<typeof WorkflowRpcs>,
    RpcClientError.RpcClientError
  >
>() {
  static layer = Layer.scoped(
    EmailWorkflowClient,
    RpcClient.make(WorkflowRpcs),
  );
}
