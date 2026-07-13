import type { NukeAction, NukeSeverity, RecommendedAction } from "../core/types.js";

export interface WindowModuleOptions {
  enabled?: boolean;
  threshold?: number;
  windowMs?: number;
  cooldownMs?: number;
  severity?: NukeSeverity;
  recommendedActions?: readonly RecommendedAction[];
}

export interface ActionWaveOptions extends WindowModuleOptions {
  actions?: readonly NukeAction[];
}

export interface DangerousPermissionGrantOptions {
  enabled?: boolean;
  dangerousPermissions?: readonly string[];
  severity?: NukeSeverity;
  recommendedActions?: readonly RecommendedAction[];
}
