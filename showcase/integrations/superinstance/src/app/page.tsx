"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useState, useEffect } from "react";

type SystemStatus = {
  name: string;
  status: "online" | "offline" | "checking";
  url: string;
  description: string;
};

const SYSTEMS: SystemStatus[] = [
  { name: "Nebula Reflex Engine", status: "checking", url: "https://fleet-murmur-worker.casey-digennaro.workers.dev/api/health", description: "Edge reflex matching at ~700ms" },
  { name: "VoxelWorks Gateway", status: "checking", url: "https://voxelworks-fix.casey-digennaro.workers.dev", description: "Game dev environment, 5 rooms" },
  { name: "DeepSeek V4 Flash", status: "online", url: "https://api.deepinfra.com", description: "1M context LLM" },
  { name: "Construct Hub", status: "checking", url: "https://github.com/SuperInstance/construct-coordination", description: "Fleet coordination, docs" },
  { name: "CraftMind Ranch", status: "checking", url: "https://github.com/SuperInstance/craftmind-ranch", description: "AI creature evolution" },
];

function StatusIndicator() {
  const [systems, setSystems] = useState<SystemStatus[]>(SYSTEMS);

  useEffect(() => {
    const checkSystems = async () => {
      const results = await Promise.all(
        systems.map(async (s) => {
          if (s.url.startsWith("http")) {
            try {
              const res = await fetch(s.url, { signal: AbortSignal.timeout(5000) });
              return { ...s, status: res.ok ? "online" as const : "offline" as const };
            } catch {
              return { ...s, status: "offline" as const };
            }
          }
          return { ...s, status: "online" as const };
        })
      );
      setSystems(results);
    };
    checkSystems();
    const interval = setInterval(checkSystems, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      {systems.map((s) => (
        <div key={s.name} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span className={`status-dot ${s.status}`} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FleetSidebar() {
  return (
    <div style={{
      width: 280,
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      overflow: "auto",
      flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🦀 Fleet Copilot</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>SuperInstance Systems</div>
      </div>

      <div style={{
        background: "var(--bg)",
        borderRadius: 10,
        padding: 14,
        border: "1px solid var(--border)",
        fontSize: 13,
        lineHeight: 1.5,
      }}>
        <strong>Quick Actions</strong>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["Check Nebula status", "How many reflexes does Nebula have?"],
            ["VoxelWorks health", "Is VoxelWorks gateway healthy?"],
            ["Fleet overview", "Give me a fleet status summary"],
            ["Architecture", "Explain the 5-layer cognitive compiler"],
            ["Crate ecosystem", "How many ternary crates exist?"],
            ["CraftMind evolution", "What species are evolving right now?"],
          ].map(([label, prompt]) => (
            <button key={label} className="si-btn" style={{
              textAlign: "left",
              padding: "6px 12px",
              fontSize: 12,
            }} onClick={() => {
              // The CopilotKit chat doesn't expose a programmatic send API
              // in a clean way. These are visual suggestions.
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--bg)",
        borderRadius: 10,
        padding: 14,
        border: "1px solid var(--border)",
        fontSize: 12,
        lineHeight: 1.6,
        color: "var(--text-dim)",
      }}>
        <strong style={{ color: "var(--text)" }}>Active Sessions</strong>
        <div style={{ marginTop: 6 }}>
          <div>🅰️ <span style={{ color: "var(--green)" }}>Claude Code</span> — Engine audit</div>
          <div>🏛️ <span style={{ color: "var(--green)" }}>Hermes 405B</span> — LGSP spec</div>
          <div>🔬 <span style={{ color: "var(--green)" }}>DeepSeek Pro</span> — Bug fixes</div>
          <div>❌ <span style={{ color: "var(--orange)" }}>MiniMax</span> — Key expired</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
    }}>
      <FleetSidebar />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          padding: "16px 24px 0",
        }}>
          <StatusIndicator />
        </div>
        <div style={{
          flex: 1,
          padding: "0 24px 24px",
          minHeight: 0,
        }}>
          <CopilotKit
            runtimeUrl="/api/copilotkit"
            showDevConsole={false}
          >
            <CopilotChat
              instructions={[
                "You are the SuperInstance Fleet Copilot.",
                "You have access to DeepSeek V4 Flash with 1M context.",
                "You can answer questions about fleet status, Nebula reflexes,",
                "VoxelWorks game development, CraftMind evolution, and system architecture.",
                "The user is Casey — the fleet commander. Be direct and concise.",
              ]}
              labels={{
                title: "🦀 Fleet Copilot",
                initial: "Ask me about the SuperInstance ecosystem — fleet status, architecture, or any system.",
              }}
            />
          </CopilotKit>
        </div>
      </div>
    </div>
  );
}
