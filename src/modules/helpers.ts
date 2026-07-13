import type { GuildMutationEvent, ResetScope } from "../core/types.js";

export const executorScopeKey = (event: GuildMutationEvent): string | null =>
  event.executorId ? `${event.guildId}:${event.executorId}` : null;

export const matchesScope = (key: string, scope?: ResetScope): boolean => {
  if (!scope) return true;
  const [guildId, executorId] = key.split(":");
  return (
    (!scope.guildId || scope.guildId === guildId) &&
    (!scope.executorId || scope.executorId === executorId)
  );
};

export const assertPositive = (name: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number.`);
};

export const unique = <T>(values: readonly T[]): readonly T[] => [...new Set(values)];
