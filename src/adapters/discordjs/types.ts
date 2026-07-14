import type { Client } from "discord.js";
import type {
  AntiNukeEngineOptions,
  AntiNukeIncident,
  GuildMutationEvent,
  NukeSeverity,
} from "../../core/types.js";

export type DiscordJsAntiNukeEnforcementAction =
  | "remove-dangerous-roles"
  | "timeout-executor"
  | "ban-executor"
  | "send-alert";

export type DiscordJsAntiNukeEnforcementStatus = "planned" | "applied" | "skipped" | "failed";

export interface DiscordJsAntiNukeEnforcementResult {
  readonly action: DiscordJsAntiNukeEnforcementAction;
  readonly status: DiscordJsAntiNukeEnforcementStatus;
  readonly incidentId: string;
  readonly executorId: string | null;
  readonly detail?: string | undefined;
}

export interface DiscordJsAntiNukeEnforcementErrorContext {
  readonly action: DiscordJsAntiNukeEnforcementAction;
  readonly incident: AntiNukeIncident;
}

export interface DiscordJsAntiNukeEnforcementOptions {
  readonly enabled?: boolean | undefined;
  readonly dryRun?: boolean | undefined;
  readonly removeDangerousRoles?: boolean | undefined;
  readonly timeout?:
    | {
        readonly enabled?: boolean | undefined;
        readonly durationMs?: number | undefined;
        readonly minimumSeverity?: NukeSeverity | undefined;
      }
    | undefined;
  readonly ban?:
    | {
        readonly enabled?: boolean | undefined;
        readonly minimumSeverity?: NukeSeverity | undefined;
      }
    | undefined;
  readonly alertChannelId?: string | undefined;
  readonly ignoredRoleIds?: readonly string[] | undefined;
  readonly reasonPrefix?: string | undefined;
  readonly onAction?:
    | ((result: DiscordJsAntiNukeEnforcementResult) => void | Promise<void>)
    | undefined;
  readonly onError?:
    | ((error: unknown, context: DiscordJsAntiNukeEnforcementErrorContext) => void | Promise<void>)
    | undefined;
}

export interface DiscordJsAntiNukeOptions
  extends Omit<AntiNukeEngineOptions, "shouldIgnore" | "onIncident"> {
  readonly onIncident?: AntiNukeEngineOptions["onIncident"] | undefined;
  readonly enforcement?: DiscordJsAntiNukeEnforcementOptions | undefined;
  readonly ignoreSelf?: boolean | undefined;
  readonly ignoreBots?: boolean | undefined;
  readonly ignoredGuildIds?: readonly string[] | undefined;
  readonly ignoredExecutorIds?: readonly string[] | undefined;
  readonly shouldIgnore?: AntiNukeEngineOptions["shouldIgnore"] | undefined;
}

export interface DiscordJsAntiNukeAdapter {
  readonly client: Client;
  start(): void;
  stop(): void;
  handle(event: GuildMutationEvent): Promise<readonly AntiNukeIncident[]>;
}
