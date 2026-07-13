import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createRoleDeleteWaveModule = (options: WindowModuleOptions = {}): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "role-delete-wave",
      name: "Role deletion wave",
      actions: ["role-delete"],
      threshold: 3,
      windowMs: 10_000,
      cooldownMs: 20_000,
      summary: (count, windowMs) => `${count} roles were deleted within ${windowMs}ms.`,
    },
    options,
  );
