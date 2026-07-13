import type { GuildMutationEvent, NukeAction } from "../src/core/types.js";

let sequence = 0;
export const mutation = (overrides: Partial<GuildMutationEvent> = {}): GuildMutationEvent => {
  sequence += 1;
  return {
    guildId: "guild-1",
    auditLogEntryId: `entry-${sequence}`,
    action: "channel-delete" as NukeAction,
    executorId: "executor-1",
    executorIsBot: false,
    targetId: `target-${sequence}`,
    targetType: "Channel",
    createdAt: sequence * 1_000,
    reason: null,
    changes: [],
    addedPermissions: [],
    ...overrides,
  };
};
