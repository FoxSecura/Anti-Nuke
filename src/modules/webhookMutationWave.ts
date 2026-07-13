import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createWebhookMutationWaveModule = (
  options: WindowModuleOptions = {},
): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "webhook-mutation-wave",
      name: "Webhook mutation wave",
      actions: ["webhook-create", "webhook-update", "webhook-delete"],
      threshold: 3,
      windowMs: 10_000,
      cooldownMs: 20_000,
      summary: (count, windowMs) => `${count} webhook mutations occurred within ${windowMs}ms.`,
    },
    options,
  );
