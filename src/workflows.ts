import { Workflow, WorkflowProxy } from "@effect/workflow";
import { Schema } from "effect";

export const EmailWorkflow = Workflow.make({
  name: "EmailWorkflow",

  success: Schema.String,

  payload: {
    id: Schema.String,
    to: Schema.String,
  },

  idempotencyKey: ({ id }) => id,
});

export const WorkflowRpcs = WorkflowProxy.toRpcGroup([EmailWorkflow] as const);
