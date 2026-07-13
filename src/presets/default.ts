import type { AntiNukeModule } from "../core/types.js";
import {
  createChannelDeleteWaveModule,
  createDangerousPermissionGrantModule,
  createDestructiveActionWaveModule,
  createMemberBanWaveModule,
  createMemberKickWaveModule,
  createRoleDeleteWaveModule,
  createWebhookMutationWaveModule,
} from "../modules/index.js";

export interface DefaultPresetOptions {
  disabledModules?: readonly string[];
}

export const createDefaultAntiNukePreset = (
  options: DefaultPresetOptions = {},
): readonly AntiNukeModule[] => {
  const disabled = new Set(options.disabledModules ?? []);
  return [
    createChannelDeleteWaveModule(),
    createRoleDeleteWaveModule(),
    createMemberBanWaveModule(),
    createMemberKickWaveModule(),
    createWebhookMutationWaveModule(),
    createDestructiveActionWaveModule(),
    createDangerousPermissionGrantModule(),
  ].filter((module) => !disabled.has(module.id));
};
