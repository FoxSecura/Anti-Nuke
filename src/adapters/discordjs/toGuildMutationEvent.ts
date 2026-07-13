import {
  AuditLogEvent,
  type Guild,
  type GuildAuditLogsEntry,
  PermissionsBitField,
} from "discord.js";
import type { GuildMutationEvent, MutationChange, NukeAction } from "../../core/types.js";

const ACTIONS: Partial<Record<AuditLogEvent, NukeAction>> = {
  [AuditLogEvent.GuildUpdate]: "guild-update",
  [AuditLogEvent.ChannelCreate]: "channel-create",
  [AuditLogEvent.ChannelUpdate]: "channel-update",
  [AuditLogEvent.ChannelDelete]: "channel-delete",
  [AuditLogEvent.MemberKick]: "member-kick",
  [AuditLogEvent.MemberBanAdd]: "member-ban",
  [AuditLogEvent.MemberRoleUpdate]: "member-role-update",
  [AuditLogEvent.BotAdd]: "bot-add",
  [AuditLogEvent.RoleCreate]: "role-create",
  [AuditLogEvent.RoleUpdate]: "role-update",
  [AuditLogEvent.RoleDelete]: "role-delete",
  [AuditLogEvent.WebhookCreate]: "webhook-create",
  [AuditLogEvent.WebhookUpdate]: "webhook-update",
  [AuditLogEvent.WebhookDelete]: "webhook-delete",
  [AuditLogEvent.IntegrationCreate]: "integration-create",
  [AuditLogEvent.IntegrationUpdate]: "integration-update",
  [AuditLogEvent.IntegrationDelete]: "integration-delete",
};

const stringify = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const normalizeChanges = (entry: GuildAuditLogsEntry): readonly MutationChange[] =>
  entry.changes.map((change) => {
    const normalized: MutationChange = { key: change.key };
    const oldValue = stringify(change.old);
    const newValue = stringify(change.new);
    if (oldValue !== undefined) normalized.oldValue = oldValue;
    if (newValue !== undefined) normalized.newValue = newValue;
    return normalized;
  });

const toBits = (value: unknown): bigint => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" || typeof value === "string") {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
};

const addedPermissions = (entry: GuildAuditLogsEntry): readonly string[] => {
  const change = entry.changes.find((item) => item.key === "permissions");
  if (!change) return [];
  const oldBits = toBits(change.old);
  const newBits = toBits(change.new);
  return new PermissionsBitField(newBits & ~oldBits).toArray();
};

export const toGuildMutationEvent = (
  entry: GuildAuditLogsEntry,
  guild: Guild,
): GuildMutationEvent | null => {
  const action = ACTIONS[entry.action];
  if (!action) return null;
  return {
    guildId: guild.id,
    auditLogEntryId: entry.id,
    action,
    executorId: entry.executorId,
    executorIsBot: entry.executor?.bot ?? false,
    targetId: entry.targetId,
    targetType: entry.targetType,
    createdAt: entry.createdTimestamp,
    reason: entry.reason,
    changes: normalizeChanges(entry),
    addedPermissions: addedPermissions(entry),
  };
};
