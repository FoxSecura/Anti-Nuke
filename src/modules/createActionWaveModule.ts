import { SlidingWindowStore } from "../core/SlidingWindowStore.js";
import type { AntiNukeModule, NukeAction } from "../core/types.js";
import { assertPositive, executorScopeKey, matchesScope, unique } from "./helpers.js";
import type { ActionWaveOptions } from "./types.js";

interface StoredMutation {
  auditLogEntryId: string;
  action: NukeAction;
  targetId: string | null;
}

interface ActionWaveDefinition {
  id: string;
  name: string;
  actions: readonly NukeAction[];
  threshold: number;
  windowMs: number;
  cooldownMs: number;
  summary: (count: number, windowMs: number) => string;
}

export const createActionWaveModule = (
  definition: ActionWaveDefinition,
  options: ActionWaveOptions = {},
): AntiNukeModule => {
  const enabled = options.enabled ?? true;
  const actions = new Set(options.actions ?? definition.actions);
  const threshold = options.threshold ?? definition.threshold;
  const windowMs = options.windowMs ?? definition.windowMs;
  const cooldownMs = options.cooldownMs ?? definition.cooldownMs;
  const severity = options.severity ?? "critical";
  const recommendedActions = options.recommendedActions ?? [
    "log",
    "notify-security-team",
    "review-audit-log",
    "revoke-executor-access",
    "freeze-mutations",
  ];
  assertPositive("threshold", threshold);
  assertPositive("windowMs", windowMs);
  assertPositive("cooldownMs", cooldownMs);

  const mutations = new SlidingWindowStore<StoredMutation>();
  const cooldowns = new Map<string, number>();

  return {
    id: definition.id,
    name: definition.name,
    evaluate(event, context) {
      if (!enabled || !actions.has(event.action)) return null;
      const key = executorScopeKey(event);
      if (!key) return null;
      mutations.add(key, event.createdAt, {
        auditLogEntryId: event.auditLogEntryId,
        action: event.action,
        targetId: event.targetId,
      });
      const active = mutations.values(key, event.createdAt - windowMs);
      if (active.length < threshold || (cooldowns.get(key) ?? 0) > event.createdAt) return null;
      cooldowns.set(key, event.createdAt + cooldownMs);
      return context.createIncident({
        moduleId: definition.id,
        guildId: event.guildId,
        executorId: event.executorId,
        auditLogEntryIds: active.map((item) => item.auditLogEntryId),
        targetIds: active.flatMap((item) => (item.targetId ? [item.targetId] : [])),
        actions: unique(active.map((item) => item.action)),
        severity,
        detectedAt: event.createdAt,
        summary: definition.summary(active.length, windowMs),
        evidence: { actionCount: active.length, threshold, windowMs },
        recommendedActions,
      });
    },
    reset(scope) {
      mutations.clear((key) => matchesScope(key, scope));
      for (const key of cooldowns.keys()) if (matchesScope(key, scope)) cooldowns.delete(key);
    },
  };
};
