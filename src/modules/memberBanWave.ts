import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createMemberBanWaveModule = (options: WindowModuleOptions = {}): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "member-ban-wave",
      name: "Member ban wave",
      actions: ["member-ban"],
      threshold: 5,
      windowMs: 10_000,
      cooldownMs: 20_000,
      summary: (count, windowMs) => `${count} members were banned within ${windowMs}ms.`,
    },
    options,
  );
