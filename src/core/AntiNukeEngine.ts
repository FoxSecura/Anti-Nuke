import { createModuleContext } from "./incident.js";
import type { AntiNukeEngineOptions, AntiNukeIncident, GuildMutationEvent } from "./types.js";

export class AntiNukeEngine {
  readonly #options: AntiNukeEngineOptions;
  readonly #context = createModuleContext();

  constructor(options: AntiNukeEngineOptions) {
    if (options.modules.length === 0)
      throw new Error("AntiNukeEngine requires at least one module.");
    const ids = new Set<string>();
    for (const module of options.modules) {
      if (ids.has(module.id)) throw new Error(`Duplicate anti-nuke module id: ${module.id}`);
      ids.add(module.id);
    }
    this.#options = options;
  }

  async handle(event: GuildMutationEvent): Promise<readonly AntiNukeIncident[]> {
    if (await this.#options.shouldIgnore?.(event)) return [];
    const incidents: AntiNukeIncident[] = [];
    for (const module of this.#options.modules) {
      try {
        const incident = module.evaluate(event, this.#context);
        if (!incident) continue;
        incidents.push(incident);
        await this.#options.onIncident(incident);
      } catch (error) {
        await this.#options.onModuleError?.(error, module, event);
      }
    }
    return incidents;
  }

  reset(scope?: { guildId?: string; executorId?: string }): void {
    for (const module of this.#options.modules) module.reset?.(scope);
  }
}
