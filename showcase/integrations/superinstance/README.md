# SuperInstance Fleet Copilot

A CopilotKit showcase that turns the SuperInstance fleet into a chat-driven development environment.

## Overview

This integration connects **CopilotKit's chat UI** to **SuperInstance's backend systems**:

```
┌─────────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  CopilotKit Chat    │────▶│  SuperInstance    │────▶│  DeepSeek V4    │
│  (React UI)         │     │  Agent (runtime)  │     │  Flash (LLM)    │
│                     │     │                   │     │                 │
│  • Chat interface   │     │  • System prompt  │     │  • 1M context   │
│  • Status sidebar   │     │  • Fleet tools    │     │  • Fast stream  │
│  • Quick actions    │     │  • Tool routing   │     │  • OpenAI-compat │
└─────────────────────┘     └───────────────────┘     └─────────────────┘
```

## What It Does

A chat interface that answers questions about:
- **Nebula reflex engine** — reflex count, fast-path stats, health
- **VoxelWorks game dev** — gateway status, room availability
- **CraftMind evolution** — species, generations, fitness
- **Cognitive Compiler** — the 5-layer architecture explained
- **Ternary crate ecosystem** — crate count, connectivity
- **Fleet status** — which sub-agents are running, what they're doing

## Running

```bash
# Set your DeepInfra key
export DEEPINFRA_API_KEY=sk-...

cd showcase/integrations/superinstance
pnpm install
pnpm dev
```

## Deployment

The runtime can deploy on **Vercel** (Next.js). The frontend can also deploy
on **Cloudflare Pages** with a Worker runtime adapter.

## Architecture

### Custom Agent
`src/lib/superinstance-agent.ts` — A `SuperInstanceAgent` that:
- Extends `AbstractAgent` from `@ag-ui/client`
- Routes conversation through DeepSeek V4 Flash via DeepInfra
- Has a rich system prompt encoding the full SuperInstance ecosystem

### Fleet Tools
`src/lib/tools.ts` — Handlers for querying live systems:
- `get_nebula_status` — Ping the reflex engine
- `query_voxelworks_gateway` — Check the game dev gateway
- `get_fleet_docs` — Documentation index
- `get_system_info` — Server status

### UI
`src/app/page.tsx` — React dashboard with:
- Live system status indicators (checking every 30s)
- Quick action buttons for common queries
- Full CopilotKit chat interface
- Fleet sidebar with active session view

## Files
```
showcase/integrations/superinstance/
├── src/
│   ├── app/
│   │   ├── api/copilotkit/route.ts   # CopilotKit runtime endpoint
│   │   ├── globals.css               # Fleet theme
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main chat dashboard
│   └── lib/
│       ├── superinstance-agent.ts    # Custom fleet agent
│       └── tools.ts                  # Fleet system tools
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```
