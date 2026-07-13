import { describe, expect, it } from "vitest";
import { createDefaultAntiNukePreset } from "../src/presets/default.js";

describe("default preset", () => {
  it("contains seven modules", () => {
    expect(createDefaultAntiNukePreset()).toHaveLength(7);
  });
  it("can disable modules", () => {
    const modules = createDefaultAntiNukePreset({ disabledModules: ["member-kick-wave"] });
    expect(modules.some((module) => module.id === "member-kick-wave")).toBe(false);
  });
});
