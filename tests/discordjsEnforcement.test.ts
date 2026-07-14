import type { Client } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import type { AntiNukeIncident } from "../src/core/types.js";
import { enforceAntiNukeIncident } from "../src/adapters/discordjs/enforcement.js";

const incident: AntiNukeIncident = {
  id: "incident-1",
  moduleId: "channel-delete-wave",
  guildId: "guild-1",
  executorId: "member-1",
  auditLogEntryIds: ["entry-1"],
  targetIds: ["channel-1"],
  actions: ["channel-delete"],
  severity: "high",
  detectedAt: 1,
  summary: "Rapid channel deletions detected.",
  evidence: { count: 3 },
  recommendedActions: ["log", "review-audit-log", "revoke-executor-access", "lockdown"],
};

const client = {} as Client;

describe("enforceAntiNukeIncident", () => {
  it("does nothing until enforcement is explicitly enabled", async () => {
    await expect(enforceAntiNukeIncident(client, incident)).resolves.toEqual([]);
  });

  it("plans access revocation without mutating Discord in dry-run mode", async () => {
    const onAction = vi.fn();
    const results = await enforceAntiNukeIncident(client, incident, {
      enabled: true,
      dryRun: true,
      alertChannelId: "alerts",
      onAction,
    });

    expect(results).toEqual([
      {
        action: "remove-dangerous-roles",
        status: "planned",
        incidentId: "incident-1",
        executorId: "member-1",
      },
      {
        action: "timeout-executor",
        status: "planned",
        incidentId: "incident-1",
        executorId: "member-1",
      },
      {
        action: "send-alert",
        status: "planned",
        incidentId: "incident-1",
        executorId: "member-1",
      },
    ]);
    expect(onAction).toHaveBeenCalledTimes(3);
  });
});
