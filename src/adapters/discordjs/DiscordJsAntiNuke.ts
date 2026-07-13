import { type Client, Events, type Guild, type GuildAuditLogsEntry } from "discord.js";
import { AntiNukeEngine } from "../../core/AntiNukeEngine.js";
import type { GuildMutationEvent } from "../../core/types.js";
import { toGuildMutationEvent } from "./toGuildMutationEvent.js";
import type { DiscordJsAntiNukeOptions } from "./types.js";

export class DiscordJsAntiNuke {
  readonly #engine: AntiNukeEngine;
  #started = false;

  constructor(
    readonly client: Client,
    options: DiscordJsAntiNukeOptions,
  ) {
    const ignoredGuildIds = new Set(options.ignoredGuildIds ?? []);
    const ignoredExecutorIds = new Set(options.ignoredExecutorIds ?? []);
    this.#engine = new AntiNukeEngine({
      modules: options.modules,
      onIncident: options.onIncident,
      ...(options.onModuleError ? { onModuleError: options.onModuleError } : {}),
      shouldIgnore: async (event) => {
        if (ignoredGuildIds.has(event.guildId)) return true;
        if (event.executorId && ignoredExecutorIds.has(event.executorId)) return true;
        if ((options.ignoreSelf ?? true) && event.executorId === this.client.user?.id) return true;
        if ((options.ignoreBots ?? false) && event.executorIsBot) return true;
        return (await options.shouldIgnore?.(event)) ?? false;
      },
    });
  }

  start(): void {
    if (this.#started) return;
    this.client.on(Events.GuildAuditLogEntryCreate, this.#onAuditLogEntryCreate);
    this.#started = true;
  }

  stop(): void {
    if (!this.#started) return;
    this.client.off(Events.GuildAuditLogEntryCreate, this.#onAuditLogEntryCreate);
    this.#started = false;
  }

  async handle(event: GuildMutationEvent): Promise<void> {
    await this.#engine.handle(event);
  }

  readonly #onAuditLogEntryCreate = async (
    entry: GuildAuditLogsEntry,
    guild: Guild,
  ): Promise<void> => {
    const event = toGuildMutationEvent(entry, guild);
    if (event) await this.#engine.handle(event);
  };
}
