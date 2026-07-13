export type NukeSeverity = "low" | "medium" | "high" | "critical";

export type RecommendedAction =
  | "log"
  | "notify-security-team"
  | "review-audit-log"
  | "revoke-executor-access"
  | "freeze-mutations"
  | "lockdown";

export type NukeAction =
  | "guild-update"
  | "channel-create"
  | "channel-update"
  | "channel-delete"
  | "role-create"
  | "role-update"
  | "role-delete"
  | "member-kick"
  | "member-ban"
  | "member-role-update"
  | "bot-add"
  | "webhook-create"
  | "webhook-update"
  | "webhook-delete"
  | "integration-create"
  | "integration-update"
  | "integration-delete";

export interface MutationChange {
  key: string;
  oldValue?: string;
  newValue?: string;
}

export interface GuildMutationEvent {
  guildId: string;
  auditLogEntryId: string;
  action: NukeAction;
  executorId: string | null;
  executorIsBot: boolean;
  targetId: string | null;
  targetType: string;
  createdAt: number;
  reason: string | null;
  changes: readonly MutationChange[];
  addedPermissions: readonly string[];
}

export interface NukeEvidence {
  readonly [key: string]: string | number | boolean | readonly string[];
}

export interface AntiNukeIncident {
  id: string;
  moduleId: string;
  guildId: string;
  executorId: string | null;
  auditLogEntryIds: readonly string[];
  targetIds: readonly string[];
  actions: readonly NukeAction[];
  severity: NukeSeverity;
  detectedAt: number;
  summary: string;
  evidence: NukeEvidence;
  recommendedActions: readonly RecommendedAction[];
}

export interface ModuleContext {
  createIncident(input: Omit<AntiNukeIncident, "id">): AntiNukeIncident;
}

export interface ResetScope {
  guildId?: string;
  executorId?: string;
}

export interface AntiNukeModule {
  readonly id: string;
  readonly name: string;
  evaluate(event: GuildMutationEvent, context: ModuleContext): AntiNukeIncident | null;
  reset?(scope?: ResetScope): void;
}

export interface AntiNukeEngineOptions {
  modules: readonly AntiNukeModule[];
  onIncident: (incident: AntiNukeIncident) => void | Promise<void>;
  shouldIgnore?: (event: GuildMutationEvent) => boolean | Promise<boolean>;
  onModuleError?: (
    error: unknown,
    module: AntiNukeModule,
    event: GuildMutationEvent,
  ) => void | Promise<void>;
}
