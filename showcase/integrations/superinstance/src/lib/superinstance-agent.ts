// SuperInstance CopilotKit Agent
// A custom agent that connects CopilotKit to SuperInstance's fleet systems:
// Nebula (reflex engine), DeepSeek V4 Flash (LLM), VoxelWorks (game dev),
// CraftMind (evolution), and the cognitive compiler stack.
//
// Can be dropped into any CopilotRuntime as a drop-in agent.

import {
  AbstractAgent,
  RunAgentInput,
  EventType,
  BaseEvent,
} from "@ag-ui/client";
import { Observable } from "rxjs";

export type SuperInstanceConfig = {
  /** DeepSeek/DeepInfra API key for LLM */
  deepInfraKey?: string;
  /** DeepSeek model to use (default: deepseek/deepseek-v4-flash) */
  model?: string;
  /** Nebula reflex engine URL */
  nebulaUrl?: string;
  /** VoxelWorks gateway URL */
  voxelworksUrl?: string;
  /** Construct coordination repo URL */
  constructUrl?: string;
};

export class SuperInstanceAgent extends AbstractAgent {
  private config: SuperInstanceConfig;
  private aborted = false;

  constructor(config: SuperInstanceConfig = {}) {
    super();
    this.config = {
      model: "deepseek/deepseek-v4-flash",
      deepInfraKey: config.deepInfraKey || process.env.DEEPINFRA_API_KEY,
      nebulaUrl: config.nebulaUrl || process.env.NEBULA_URL || "https://fleet-murmur-worker.casey-digennaro.workers.dev",
      voxelworksUrl: config.voxelworksUrl || process.env.VOXELWORKS_URL || "https://voxelworks-fix.casey-digennaro.workers.dev",
      constructUrl: config.constructUrl || process.env.CONSTRUCT_URL,
      ...config,
    };
  }

  clone(): SuperInstanceAgent {
    return new SuperInstanceAgent({ ...this.config });
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      this.aborted = false;

      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      } as BaseEvent);

      // System prompt that gives the agent knowledge of our systems
      const systemPrompt = [
        "You are the SuperInstance Fleet Copilot — the AI frontend for the SuperInstance ecosystem.",
        "",
        "## Your Systems",
        "- **Nebula Reflex Engine**: Edge reflex system at " + (this.config.nebulaUrl || "nebula"),
        "  - Fast path: ~700ms reflex matching",
        "  - Slow path: DeepSeek V4 Flash via DeepInfra for novel queries",
        "  - Commands: query reflexes, teach new reflexes, check status",
        "- **VoxelWorks**: Game dev environment on Cloudflare Pages",
        "  - 5 rooms: Hub, Build Studio, Asset Lab, Ship Deck, Game Engine",
        "  - Block Studio: Scratch-style drag-and-drop game blocks",
        "  - Phaser Game Engine: 3-devel game with voxel cat",
        "- **CraftMind Ranch**: AI creature evolution",
        "  - quick-evolve.js runner for automated evolution",
        "  - Species evolve through generations with fitness scoring",
        "- **Cognitive Compiler Stack**: 5-layer architecture",
        "  - L1: Deterministic Silicon (ternary crates, Eisenstein math)",
        "  - L2: Reflex Runtime (Pincher, Nebula)",
        "  - L3: Form & Placement (cellular automata, music forms)",
        "  - L4: IR & Compilation (cellforge, cognitive JIT)",
        "  - L5: Cloud LLM (DeepSeek, Claude, Hermes, etc.)",
        "- **DeepSeek V4 Flash**: 1M context, fast reasoning (you!)",
        "",
        "## Your Capabilities",
        "You can answer questions about fleet status, architecture,",
        "the ternary crate ecosystem, CraftMind evolution, VoxelWorks",
        "game development, the cognitive compiler vision, and agent coordination.",
        "",
        "When asked about live systems, you can use tools to query them directly.",
        "",
        "## Confidentiality",
        "The user is Casey — the fleet commander. Be direct, opinionated, and concise.",
        "Skip the 'Great question!' filler. Just help.",
      ].join("\n");

      const messageHistory = input.messages.map((m) => {
        if (m.role === "tool") {
          return {
            role: "tool" as const,
            content: m.content ?? "",
            tool_call_id: m.toolCallId ?? "",
          };
        } else if (m.role === "assistant" && m.toolCalls) {
          return {
            role: "assistant" as const,
            content: m.content ?? "",
            tool_calls: m.toolCalls,
          };
        }
        return {
          role: m.role as "user" | "assistant",
          content: m.content ?? "",
        };
      });

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...messageHistory,
      ];

      const apiKey = this.config.deepInfraKey;
      if (!apiKey) {
        observer.next({
          type: EventType.RUN_ERROR,
          message: "DeepInfra API key not configured. Set DEEPINFRA_API_KEY.",
        } as BaseEvent);
        observer.complete();
        return;
      }

      this.streamFromDeepInfra(observer, input, messages, apiKey);
    });
  }

  private async streamFromDeepInfra(
    observer: any,
    input: RunAgentInput,
    messages: any[],
    apiKey: string
  ) {
    const messageId = Date.now().toString();
    try {
      const response = await fetch(
        "https://api.deepinfra.com/v1/openai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            stream: true,
            max_tokens: 4096,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text().catch(() => "");
        observer.next({
          type: EventType.RUN_ERROR,
          message: `DeepInfra returned ${response.status}: ${err.slice(0, 200)}`,
        });
        observer.complete();
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        observer.next({
          type: EventType.RUN_ERROR,
          message: "No response body",
        });
        observer.complete();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || this.aborted) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              observer.next({
                type: EventType.TEXT_MESSAGE_CHUNK,
                messageId,
                delta,
              } as BaseEvent);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      observer.next({
        type: EventType.RUN_FINISHED,
        threadId: input.threadId,
        runId: input.runId,
      } as BaseEvent);
      observer.complete();
    } catch (error: any) {
      observer.next({
        type: EventType.RUN_ERROR,
        message: error.message || "Unknown error",
      } as BaseEvent);
      observer.complete();
    }
  }

  abort(): void {
    this.aborted = true;
  }
}
