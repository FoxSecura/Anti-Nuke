import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createMemberKickWaveModule = (options: WindowModuleOptions = {}): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "member-kick-wave",
      name: "Member kick wave",
      actions: ["member-kick"],
      threshold: 5,
      windowMs: 10_000,
      cooldownMs: 20_000,
      summary: (count, windowMs) => `${count} members were kicked within ${windowMs}ms.`,
    },
    options,
  );
