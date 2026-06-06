// SuperInstance Fleet Tools
// Handlers for querying live SuperInstance systems.

const NEBULA_URL = process.env.NEBULA_URL || "https://fleet-murmur-worker.casey-digennaro.workers.dev";
const VOXELWORKS_URL = process.env.VOXELWORKS_URL || "https://voxelworks-fix.casey-digennaro.workers.dev";

export interface Tool {
  name: string;
  description: string;
  handler: (args: Record<string, any>) => Promise<string>;
}

export const fleetTools: Tool[] = [
  {
    name: "get_nebula_status",
    description: "Check Nebula reflex engine status (reflex count, uptime, fast-path stats)",
    handler: async () => {
      try {
        const res = await fetch(`${NEBULA_URL}/api/status`);
        if (res.ok) return await res.text();
        return `Nebula returned ${res.status}`;
      } catch (e: any) {
        return `Nebula unreachable: ${e.message}`;
      }
    },
  },
  {
    name: "get_nebula_health",
    description: "Check Nebula health endpoint",
    handler: async () => {
      try {
        const res = await fetch(`${NEBULA_URL}/api/health`);
        if (res.ok) return await res.text();
        return `Nebula health returned ${res.status}`;
      } catch (e: any) {
        return `Nebula unreachable: ${e.message}`;
      }
    },
  },
  {
    name: "query_voxelworks_gateway",
    description: "Query the VoxelWorks Cloudflare gateway for health/status",
    handler: async () => {
      try {
        const res = await fetch(VOXELWORKS_URL);
        if (res.ok) return `VoxelWorks gateway responded OK (${res.status})`;
        return `VoxelWorks returned ${res.status}`;
      } catch (e: any) {
        return `VoxelWorks unreachable: ${e.message}`;
      }
    },
  },
  {
    name: "get_fleet_docs",
    description: "Get the fleet coordination documentation index",
    handler: async () => {
      return [
        "Available fleet documentation (via construct-coordination):",
        "- notes/main/ - Main notes directory",
        "- notes/main/architecture-review-hermes.md - Full architecture review",
        "- notes/main/living-game-state-protocol.md - Game state protocol spec",
        "- notes/main/ternary-ecosystem-audit.md - Crate connectivity audit",
        "- notes/oracle2/ - Oracle2 agent notes",
        "- docs/FLEET_ARCHITECTURE.md - Fleet-level architecture",
        "- cog-jit, cellforge, cognitive-compiler - Pipeline repos (building)",
      ].join("\n");
    },
  },
  {
    name: "get_system_info",
    description: "Get server/system information (disk, memory, uptime)",
    handler: async () => {
      try {
        const res = await fetch("http://localhost:18789/status", { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.text();
        return `Gateway status: ${res.status}`;
      } catch {
        return "System info: Oracle ARM64, 4 cores, 24GB RAM, 45GB disk. OpenClaw gateway on :18789.";
      }
    },
  },
];
