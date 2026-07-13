import { describe, expect, it } from "vitest";
import { createModuleContext } from "../src/core/incident.js";
import {
  createChannelDeleteWaveModule,
  createDangerousPermissionGrantModule,
  createDestructiveActionWaveModule,
  createMemberBanWaveModule,
  createMemberKickWaveModule,
  createRoleDeleteWaveModule,
  createWebhookMutationWaveModule,
} from "../src/modules/index.js";
import { mutation } from "./helpers.js";

const context = createModuleContext();

const trigger = (
  module: ReturnType<typeof createChannelDeleteWaveModule>,
  actions: readonly string[],
) => {
  let incident = null;
  actions.forEach((action, index) => {
    incident = module.evaluate(
      mutation({ action: action as never, createdAt: 10_000 + index * 100 }),
      context,
    );
  });
  return incident;
};

describe("anti-nuke modules", () => {
  it("detects channel deletion waves", () => {
    expect(
      trigger(createChannelDeleteWaveModule(), [
        "channel-delete",
        "channel-delete",
        "channel-delete",
      ]),
    ).not.toBeNull();
  });
  it("detects role deletion waves", () => {
    expect(
      trigger(createRoleDeleteWaveModule(), ["role-delete", "role-delete", "role-delete"]),
    ).not.toBeNull();
  });
  it("detects ban waves", () => {
    expect(trigger(createMemberBanWaveModule(), Array(5).fill("member-ban"))).not.toBeNull();
  });
  it("detects kick waves", () => {
    expect(trigger(createMemberKickWaveModule(), Array(5).fill("member-kick"))).not.toBeNull();
  });
  it("detects webhook mutation waves", () => {
    expect(
      trigger(createWebhookMutationWaveModule(), [
        "webhook-create",
        "webhook-update",
        "webhook-delete",
      ]),
    ).not.toBeNull();
  });
  it("detects mixed destructive actions", () => {
    const actions = [
      "channel-delete",
      "role-delete",
      "member-ban",
      "member-kick",
      "webhook-delete",
      "channel-delete",
      "role-delete",
      "member-ban",
    ];
    expect(trigger(createDestructiveActionWaveModule(), actions)).not.toBeNull();
  });
  it("detects dangerous permission grants", () => {
    const module = createDangerousPermissionGrantModule();
    const incident = module.evaluate(
      mutation({ action: "role-update", addedPermissions: ["Administrator"] }),
      context,
    );
    expect(incident?.severity).toBe("critical");
  });
  it("ignores safe permission grants", () => {
    const module = createDangerousPermissionGrantModule();
    expect(
      module.evaluate(
        mutation({ action: "role-update", addedPermissions: ["ViewChannel"] }),
        context,
      ),
    ).toBeNull();
  });
  it("does not attribute waves without an executor", () => {
    const module = createChannelDeleteWaveModule({ threshold: 1 });
    expect(module.evaluate(mutation({ executorId: null }), context)).toBeNull();
  });
  it("supports scoped reset", () => {
    const module = createChannelDeleteWaveModule({ threshold: 2 });
    module.evaluate(mutation({ createdAt: 1_000 }), context);
    module.reset?.({ guildId: "guild-1", executorId: "executor-1" });
    expect(module.evaluate(mutation({ createdAt: 1_100 }), context)).toBeNull();
  });
});
