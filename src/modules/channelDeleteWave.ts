import type { AntiNukeModule } from "../core/types.js";
import { createActionWaveModule } from "./createActionWaveModule.js";
import type { WindowModuleOptions } from "./types.js";

export const createChannelDeleteWaveModule = (options: WindowModuleOptions = {}): AntiNukeModule =>
  createActionWaveModule(
    {
      id: "channel-delete-wave",
      name: "Channel deletion wave",
      actions: ["channel-delete"],
      threshold: 3,
      windowMs: 10_000,
      cooldownMs: 20_000,
      summary: (count, windowMs) => `${count} channels were deleted within ${windowMs}ms.`,
    },
    options,
  );
