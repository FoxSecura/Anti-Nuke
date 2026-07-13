import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createDestructiveActionWaveModule = (
  options: WindowModuleOptions = {},
): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "destructive-action-wave",
      name: "Mixed destructive action wave",
      actions: ["channel-delete", "role-delete", "member-ban", "member-kick", "webhook-delete"],
      threshold: 8,
      windowMs: 15_000,
      cooldownMs: 30_000,
      summary: (count, windowMs) => `${count} destructive actions occurred within ${windowMs}ms.`,
    },
    options,
  );
