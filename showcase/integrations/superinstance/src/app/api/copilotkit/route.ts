// SuperInstance CopilotKit Runtime Route
// Connects CopilotKit's React UI to the SuperInstance fleet backend.
// Uses a custom SuperInstanceAgent that routes through DeepSeek V4 Flash.

import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { SuperInstanceAgent } from "@/lib/superinstance-agent";
import { fleetTools } from "@/lib/tools";

// Wrap the SuperInstance agent with fleet tools
class TooledSuperInstanceAgent extends SuperInstanceAgent {
  run(input: any) {
    // We can't easily modify the tools list since it's on the CopilotKit side
    // For now, the agent is system-prompt-instructed about available systems
    return super.run(input);
  }
}

const runtime = new CopilotRuntime({
  agents: {
    default: new TooledSuperInstanceAgent(),
  },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
});

async function withProbeCompat(req: Request): Promise<Response> {
  const res = await handler(req);
  if (res.status === 404) {
    const body = await res.text();
    return new Response(body, { status: 400, headers: res.headers });
  }
  return res;
}

export const GET = (req: Request) => handler(req);
export const POST = (req: Request) => withProbeCompat(req);
export const OPTIONS = (req: Request) => handler(req);
