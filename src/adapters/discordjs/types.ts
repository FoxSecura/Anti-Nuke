import type { Client } from "discord.js";
import type { AntiNukeEngineOptions, GuildMutationEvent } from "../../core/types.js";

export interface DiscordJsAntiNukeOptions extends Omit<AntiNukeEngineOptions, "shouldIgnore"> {
  ignoreSelf?: boolean;
  ignoreBots?: boolean;
  ignoredGuildIds?: readonly string[];
  ignoredExecutorIds?: readonly string[];
  shouldIgnore?: AntiNukeEngineOptions["shouldIgnore"];
}

export interface DiscordJsAntiNukeAdapter {
  readonly client: Client;
  start(): void;
  stop(): void;
  handle(event: GuildMutationEvent): Promise<void>;
}
