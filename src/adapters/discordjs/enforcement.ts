import {
  PermissionFlagsBits,
  type Client,
  type GuildMember,
  type GuildTextBasedChannel,
} from "discord.js";
import type { AntiNukeIncident, NukeSeverity } from "../../core/types.js";
import type {
  DiscordJsAntiNukeEnforcementAction,
  DiscordJsAntiNukeEnforcementErrorContext,
  DiscordJsAntiNukeEnforcementOptions,
  DiscordJsAntiNukeEnforcementResult,
} from "./types.js";

const severityOrder: Readonly<Record<NukeSeverity, number>> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const DANGEROUS_PERMISSIONS =
  PermissionFlagsBits.Administrator |
  PermissionFlagsBits.ManageGuild |
  PermissionFlagsBits.ManageChannels |
  PermissionFlagsBits.ManageRoles |
  PermissionFlagsBits.ManageWebhooks |
  PermissionFlagsBits.BanMembers |
  PermissionFlagsBits.KickMembers;

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

function hasMinimumSeverity(current: NukeSeverity, minimum: NukeSeverity): boolean {
  return severityOrder[current] >= severityOrder[minimum];
}

function reasonFor(
  incident: AntiNukeIncident,
  options: DiscordJsAntiNukeEnforcementOptions,
): string {
  const prefix = options.reasonPrefix ?? "FoxSecura Anti-Nuke";
  return `${prefix}: ${incident.moduleId} (${incident.id})`.slice(0, 512);
}

function plannedActions(
  incident: AntiNukeIncident,
  options: DiscordJsAntiNukeEnforcementOptions,
): readonly DiscordJsAntiNukeEnforcementAction[] {
  const recommended = new Set(incident.recommendedActions);
  const actions: DiscordJsAntiNukeEnforcementAction[] = [];

  if (incident.executorId && recommended.has("revoke-executor-access")) {
    if (
      (options.ban?.enabled ?? false) &&
      hasMinimumSeverity(incident.severity, options.ban?.minimumSeverity ?? "critical")
    ) {
      actions.push("ban-executor");
    } else {
      if (options.removeDangerousRoles ?? true) actions.push("remove-dangerous-roles");
      if (
        (options.timeout?.enabled ?? true) &&
        hasMinimumSeverity(incident.severity, options.timeout?.minimumSeverity ?? "high")
      ) {
        actions.push("timeout-executor");
      }
    }
  }

  if (options.alertChannelId) actions.push("send-alert");
  return actions;
}

function isProtectedMember(
  client: Client,
  member: GuildMember,
  options: DiscordJsAntiNukeEnforcementOptions,
): boolean {
  if (member.id === member.guild.ownerId) return true;
  if (member.id === client.user?.id) return true;
  return (options.ignoredRoleIds ?? []).some((roleId) => member.roles.cache.has(roleId));
}

async function report(
  result: DiscordJsAntiNukeEnforcementResult,
  options: DiscordJsAntiNukeEnforcementOptions,
  results: DiscordJsAntiNukeEnforcementResult[],
): Promise<void> {
  results.push(result);
  await options.onAction?.(result);
}

async function reportError(
  error: unknown,
  context: DiscordJsAntiNukeEnforcementErrorContext,
  options: DiscordJsAntiNukeEnforcementOptions,
  results: DiscordJsAntiNukeEnforcementResult[],
): Promise<void> {
  const result: DiscordJsAntiNukeEnforcementResult = {
    action: context.action,
    status: "failed",
    incidentId: context.incident.id,
    executorId: context.incident.executorId,
    detail: error instanceof Error ? error.message : String(error),
  };
  results.push(result);
  await options.onError?.(error, context);
  await options.onAction?.(result);
}

export async function enforceAntiNukeIncident(
  client: Client,
  incident: AntiNukeIncident,
  options: DiscordJsAntiNukeEnforcementOptions = {},
): Promise<readonly DiscordJsAntiNukeEnforcementResult[]> {
  if (options.enabled !== true) return [];

  const actions = plannedActions(incident, options);
  if (actions.length === 0) return [];

  if (options.dryRun === true) {
    const results = actions.map<DiscordJsAntiNukeEnforcementResult>((action) => ({
      action,
      status: "planned",
      incidentId: incident.id,
      executorId: incident.executorId,
    }));
    for (const result of results) await options.onAction?.(result);
    return results;
  }

  const results: DiscordJsAntiNukeEnforcementResult[] = [];
  const guild =
    client.guilds.cache.get(incident.guildId) ?? (await client.guilds.fetch(incident.guildId));
  const reason = reasonFor(incident, options);
  let member: GuildMember | null | undefined;

  for (const action of actions) {
    try {
      if (action === "send-alert") {
        const channel = await guild.channels.fetch(options.alertChannelId ?? "");
        if (!channel?.isTextBased()) {
          await report(
            {
              action,
              status: "skipped",
              incidentId: incident.id,
              executorId: incident.executorId,
              detail: "Alert channel is unavailable or is not text based.",
            },
            options,
            results,
          );
          continue;
        }

        await (channel as GuildTextBasedChannel).send({
          content: [
            `**FoxSecura Anti-Nuke** — ${incident.severity.toUpperCase()}`,
            incident.summary,
            `Executor: ${incident.executorId ? `<@${incident.executorId}>` : "unknown"}`,
            `Actions: ${incident.actions.join(", ")}`,
            `Module: \`${incident.moduleId}\``,
            `Incident: \`${incident.id}\``,
          ].join("\n"),
          allowedMentions: { users: [] },
        });
        await report(
          {
            action,
            status: "applied",
            incidentId: incident.id,
            executorId: incident.executorId,
          },
          options,
          results,
        );
        continue;
      }

      if (!incident.executorId) {
        await report(
          {
            action,
            status: "skipped",
            incidentId: incident.id,
            executorId: null,
            detail: "Audit-log executor is unknown.",
          },
          options,
          results,
        );
        continue;
      }

      member ??=
        guild.members.cache.get(incident.executorId) ??
        (await guild.members.fetch(incident.executorId).catch(() => null));
      if (!member || isProtectedMember(client, member, options)) {
        await report(
          {
            action,
            status: "skipped",
            incidentId: incident.id,
            executorId: incident.executorId,
            detail: "Executor is unavailable or protected by safeguards.",
          },
          options,
          results,
        );
        continue;
      }

      if (action === "remove-dangerous-roles") {
        const roleIds = member.roles.cache
          .filter(
            (role) =>
              role.id !== guild.id &&
              !role.managed &&
              role.editable &&
              role.permissions.any(DANGEROUS_PERMISSIONS),
          )
          .map((role) => role.id);

        if (roleIds.length === 0) {
          await report(
            {
              action,
              status: "skipped",
              incidentId: incident.id,
              executorId: incident.executorId,
              detail: "No editable dangerous role was found.",
            },
            options,
            results,
          );
          continue;
        }

        await member.roles.remove(roleIds, reason);
        await report(
          {
            action,
            status: "applied",
            incidentId: incident.id,
            executorId: incident.executorId,
            detail: `${roleIds.length} dangerous role(s) removed.`,
          },
          options,
          results,
        );
        continue;
      }

      if (action === "timeout-executor") {
        if (!member.moderatable) {
          await report(
            {
              action,
              status: "skipped",
              incidentId: incident.id,
              executorId: incident.executorId,
              detail: "Discord role hierarchy prevents this timeout.",
            },
            options,
            results,
          );
          continue;
        }

        const durationMs = Math.min(
          Math.max(options.timeout?.durationMs ?? 60 * 60 * 1000, 1_000),
          MAX_TIMEOUT_MS,
        );
        await member.timeout(durationMs, reason);
        await report(
          {
            action,
            status: "applied",
            incidentId: incident.id,
            executorId: incident.executorId,
            detail: `Timeout applied for ${durationMs}ms.`,
          },
          options,
          results,
        );
        continue;
      }

      if (!member.bannable) {
        await report(
          {
            action,
            status: "skipped",
            incidentId: incident.id,
            executorId: incident.executorId,
            detail: "Discord role hierarchy prevents this ban.",
          },
          options,
          results,
        );
        continue;
      }

      await member.ban({ reason, deleteMessageSeconds: 0 });
      await report(
        {
          action,
          status: "applied",
          incidentId: incident.id,
          executorId: incident.executorId,
        },
        options,
        results,
      );
    } catch (error) {
      await reportError(error, { action, incident }, options, results);
    }
  }

  return results;
}
