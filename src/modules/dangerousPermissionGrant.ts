import type { AntiNukeModule } from "../core/types.js";
import { unique } from "./helpers.js";
import type { DangerousPermissionGrantOptions } from "./types.js";

const DEFAULT_DANGEROUS_PERMISSIONS = [
  "Administrator",
  "ManageGuild",
  "ManageRoles",
  "ManageChannels",
  "BanMembers",
  "KickMembers",
  "ManageWebhooks",
] as const;

export const createDangerousPermissionGrantModule = (
  options: DangerousPermissionGrantOptions = {},
): AntiNukeModule => {
  const enabled = options.enabled ?? true;
  const dangerous = new Set(options.dangerousPermissions ?? DEFAULT_DANGEROUS_PERMISSIONS);
  const severity = options.severity ?? "critical";
  const recommendedActions = options.recommendedActions ?? [
    "log",
    "notify-security-team",
    "review-audit-log",
    "revoke-executor-access",
  ];
  return {
    id: "dangerous-permission-grant",
    name: "Dangerous permission grant",
    evaluate(event, context) {
      if (!enabled || (event.action !== "role-create" && event.action !== "role-update"))
        return null;
      const matched = unique(
        event.addedPermissions.filter((permission) => dangerous.has(permission)),
      );
      if (matched.length === 0) return null;
      return context.createIncident({
        moduleId: "dangerous-permission-grant",
        guildId: event.guildId,
        executorId: event.executorId,
        auditLogEntryIds: [event.auditLogEntryId],
        targetIds: event.targetId ? [event.targetId] : [],
        actions: [event.action],
        severity,
        detectedAt: event.createdAt,
        summary: `Dangerous permissions were granted: ${matched.join(", ")}.`,
        evidence: { permissions: matched, permissionCount: matched.length },
        recommendedActions,
      });
    },
  };
};
